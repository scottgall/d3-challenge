function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  
  return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderXtextCircles(textcirclesGroup, newXScale, chosenXAxis) {

  textcirclesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]) - 10);

  return textcirclesGroup;
}

function renderYtextCircles(textcirclesGroup, newYScale, chosenYAxis) {

  textcirclesGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]) + 7);

  return textcirclesGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  const dic = {
    poverty: {
      description: "% in poverty",
      percent: true
    },
    age: {
      description: "Median age: "
    },
    income: {
      description: "Median household income: "
    },
    healthcare: {
      description: "% lack healthcare",
      percent: true
    },
    smokes: {
      description: "% smoke",
      percent: true
    },
    obesity: {
      description: "% obese",
      percent: true
    }
  }
  var label;

  if (chosenXAxis === "hair_length") {
    label = "Hair Length:";
  }
  else {
    label = "# of Albums:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -100])
    .html(function(d) {
      return (`<strong>${d.state}</strong><br>${dic[chosenXAxis].percent ? Math.round(d[chosenXAxis]) + dic[chosenXAxis].description : dic[chosenXAxis].description + Math.round(d[chosenXAxis])}<br>${dic[chosenYAxis].percent ? Math.round(d[chosenYAxis]) + dic[chosenYAxis].description : dic[chosenYAxis].description + Math.round(d[chosenYAxis])}`);
    });
  
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  }).on("mouseout", function(data) {
    toolTip.hide(data);
  });

  return circlesGroup;
}


var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

d3.csv("data.csv").then(function(data, err) {
  if (err) throw err;
  
  data.forEach(function(d) {
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare;
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
  });

  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);
  
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  var circlesGroupAll = chartGroup.selectAll("circlesGroup").data(data).enter();
  
  var circlesGroup = circlesGroupAll
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

  var textcirclesGroup = circlesGroupAll
    .append("text")
    .text((d) => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]) - 10)
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 7)

  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")  

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", -60)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("axis-text", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", -80)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("y", -100)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obese (%)");

  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  xlabelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;
        xLinearScale = xScale(data, chosenXAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
        textcirclesGroup = renderXtextCircles(textcirclesGroup, xLinearScale, chosenXAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        xlabels = [
          {label: "poverty", obj: povertyLabel},
          {label: "age", obj: ageLabel},
          {label: "income", obj: incomeLabel}
        ];

        xlabels.forEach(i => {
          if (chosenXAxis == i.label) {
            i.obj
              .classed("active", true)
              .classed("inactive", false);
          } else {
            i.obj
              .classed("active", false)
              .classed("inactive", true);
          }
        });
      }
    });

  ylabelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        chosenYAxis = value;
        yLinearScale = yScale(data, chosenYAxis);
        yAxis = renderYAxes(yLinearScale, yAxis);
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
        textcirclesGroup = renderYtextCircles(textcirclesGroup, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        ylabels = [
          {label: "healthcare", obj: healthcareLabel},
          {label: "smokes", obj: smokesLabel},
          {label: "obesity", obj: obesityLabel}
        ];

        ylabels.forEach(i => {
          if (chosenYAxis == i.label) {
            i.obj
              .classed("active", true)
              .classed("inactive", false);
          } else {
            i.obj
              .classed("active", false)
              .classed("inactive", true);
          }
        });
      }
    });    
}).catch(function(error) {
  console.log(error);
});
