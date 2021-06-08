// I worked with Erin Wills (TA) and the following people:  ______________
// Remember to comment your code as we discuss it.  Commenting the code is required.
// Prior to starting, make sure  you have already created and cloned your repo.



// Refer to the pdf diagram to see the visual relationship of the code

// Layout of this document
// 1.  Data Exploration (always do this; understand its structure)
// 2.  Define Functions (a and e used in page load, a through e used in click event)
//      a.  xScale(hairData, chosenXAxis):  Scales data to svg width (var width defined in Section 3: Setup SVG )
//              inputs:  (data like "hairData", an axis name like "hair_length")
//              returns:  scaled data function
//      b.  renderAxes(newXScale, xAxis): Uses the xScale function and sets new x-axis values
//              inputs:  (function like "xLinearScale", object like xAxis)
//              outputs:  returns new xAxis values
//      c.  renderCircles(circlesGroup, newXScale, chosenXAxis):  Takes grouped elements like "circlesGroup" and scales data of a given axis and assigns it to the elements attribute "cx"
//              inputs:  (grouped elements like "circlesGroup", a function like "xLinearScale", a specified axis name like "chosenXAxis" (ie "hair_length"))
//              outputs:  returns updated circlesGroup elements with new x values
//      d.  **new** rendertextCircles(textcirclesGroup, newXScale, chosenXAxis)
//              inputs: (element like "textcirclesGroup", function like "xLinearScale", a specified axis name like "chosenXAxis" (ie "hair_length"))
//              outputs:  returns an updated textcirclesGroup group element with new labels
//      e.  updateToolTip:  updates circlesGroup with textbox messages
//              inputs:  (a specified axis name like "chosenXAxis", elements like "circlesGroup")
//              outputs:  calls the D3 function tip() that helps automate the tooltip message generation - returns html that is assigned to circlesGroup and has mouseover, mouseout interactivity
// 3.  Setup SVG
// 4.  BRING in Data and ADD Structure /layout
//      a.  convert data to numericals
//      b.  scale and assign axis
//      c.  create circlsGroupAll elements and circlesGroup and textcirclesGroup elements
//      d.  create 2 x-label groups, one y-label group, one albumGroup, one tooltip group
// 5. ADD updates upon clicking axis text  
//      a. Reassign these objects/elements with new values after click
//          i.  xLinearScale
//          ii. xAxis
//          iii. circlesGroup
//          iv. textcirclesGroup
//          v.  circlesGroup/tooltip
//          vi.  x-axis styling 





// #######################  1.  Data Exploration  ################ //
// CSV file shows that
//  Data has following columns:  rockband, hair_length, num_hits, num_albums
//  Once read by d3.csv then it is like an array of 20 objects as key-value pair format so I will need to use foreach or arrow functions to get arrays
//  console.log(hairData) see below after d3.csv






// #################### 2.  Define Function ###############//
// function used for updating x-scale var upon click on axis label
// scaling function: https://www.d3indepth.com/scales/
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);  //width define at beginning of main code

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// Added by Erin
// Note:  as compared to renderCircles, the attr iterator needs to match what is created initially
// So above I use "cx" and below I use "x" -  this needs to match the attr on line 245
// text is positioned by x,y attributes, circles are positioned by cx, cy attributes
function rendertextCircles(textcirclesGroup, newXScale, chosenXAxis) {

    textcirclesGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
  
    return textcirclesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "hair_length") {
    label = "Hair Length:";
  }
  else {
    label = "# of Albums:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
    });
  
  //Note:  Below circlesGroup is having the tooltip added but other elements could also have the tool tip added
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


//########################  3.  SVG Setup ###################################//

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// xScale uses width so xScale() can only be called below this point
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// #################### 4.  BRING in Data and ADD Structure ###############//

// Initial Params - includes any axis selection that has multiple options
var chosenXAxis = "obesity";
var chosenYAxis = "income";

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(data, err) {
  if (err) throw err;
  
  // parse data - set values to numerical data types
  data.forEach(function(d) {
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare;
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
  });

  // xLinearScale function above csv import; Note:  xLinearScale is functioncontains scaled data specific to the defined axis
  // Important note:  xScale uses width that is defined above; xScale can only be called below width in the code
  // scaling function: https://www.d3indepth.com/scales/
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions; generates the scaled axis
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis; adds x axis chart data tick marks to chartgroup
  // for future axis value changes then the renderAxes() function needs called
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // New by Erin - provide data first to grouped elements 
  // case is important - selectAll() works but SelectAll() would produce a type error - the capitalizaton makes a difference
  var circlesGroupAll = chartGroup.selectAll("circlesGroup").data(data).enter();

  // modfied by Erin - data is already bound to circlesGroupAll and now I am adding the 'circles' with one circle for each data
  // note that the attributes are "cx" and "cy"; the data is being scaled by the scaling functions defined above; see it is a function
  // the centers of the circles are also coming from the specific x data group 'chosenXAxis'
  // append initial circles
  var circlesGroup = circlesGroupAll
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  // added by Erin - I wanted to add text to the circles - probably several ways of doing this but here is one.
  // data is bound to ciclesGroupAll like above and now I add a text element at "x" and "y", not the difference from above.
  // added round function to make the numbers in the cirlces have no decimals; this is a random data selection; I just wanted something inside the circles. If you want to see why these values are like they are then you need to back-calculate what xScale and transpose is doing
  var textcirclesGroup = circlesGroupAll
    .append("text")
    .text((d) => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var hairLengthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "hair_length") // value to grab for event listener
    .classed("active", true)
    .text("Hair Metal Ban Hair Length (inches)");

  var albumsLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "num_albums") // value to grab for event listener
    .classed("inactive", true)
    .text("# of Albums Released");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Number of Billboard 500 Hits");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);





  // #################### 5.  ADD updates upon clicking axis text  ###############//

  // x axis labels event listener
  // if you comment out the entire labelsGroup section then you can see that the plot populates but does not update when selecting the axis
  // note that above this section, only the updateToolTip and xScale functions are called of all the user created functions at the top of the script
  // the other functions at the top of the page are used to re-define the data applied to the xLinearScale function, xAxis object, circlesGroup elements, textcirclesGroup elements, circlesGroup elements
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        // New - updates text labels within circles
        textcirclesGroup = rendertextCircles(textcirclesGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "num_albums") {
          albumsLabel
            .classed("active", true)
            .classed("inactive", false);
          hairLengthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          albumsLabel
            .classed("active", false)
            .classed("inactive", true);
          hairLengthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
