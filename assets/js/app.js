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

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// function used for updating x-scale var upon click on axis label
function xScale(my_data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(my_data, d => d[chosenXAxis]) * 0.9,
        d3.max(my_data, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
function yScale(my_data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(my_data, d => d[chosenYAxis]) * 0.8,
        d3.max(my_data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles and text group with a transition to
// new circles and new group
function renderCircles(circlesGroup, circlesText, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  circlesText
    .transition()
    .attr("dx", function(d) {
      return newXScale(d[chosenXAxis]);
    })
    .attr("dy", function(d) {
      return newYScale(d[chosenYAxis]) + 10 / 2.5;
      })
    .duration(1000);


  return circlesGroup, circlesText;
};

// function to update the regression line
function renderRegressionLine(myData, my_line, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis){
  
  var linearRegression = d3.regressionLinear()
    .x(d => (d[chosenXAxis]))
    .y(d => (d[chosenYAxis]));

  var lr = linearRegression(myData)

  let line = d3.line()
    .x(d => xLinearScale(d[0]))
    .y(d => yLinearScale(d[1]));

  my_line
    .datum(lr)
    .transition()
    .duration(1000)
    .attr("stroke", "red")
    .attr("stroke-width", 2 + "px")
    .attr("d", line);

  return my_line;
}

//function to update the R^2: Coefficient of Determination
function renderRsquared(myData, myRsquared, chosenXAxis, chosenYAxis){

  var linearRegression = d3.regressionLinear()
  .x(d => (d[chosenXAxis]))
  .y(d => (d[chosenYAxis]));

  var lr = linearRegression(myData)

  myRsquared
    .transition()
    .duration(1000)
    .text(`R²: ${lr.rSquared.toFixed(2)}`);

  return myRsquared;
};

  // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity"
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    // console.log(censusData)
    if (err) throw err;

    censusData.forEach(function(data){
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.abbr = data.abbr;
    });

          // This function allows us to set up tooltip rules (see d3-tip.js).
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
        // x key
        var theX;
        // Grab the state name.
        var theState = "<div>" + d.state + "</div>";
        // Snatch the y value's key and value.
        var theY = "<div>" + chosenYAxis + ": " + d[chosenYAxis] + "%</div>";
        // If the x key is poverty
        if (chosenXAxis === "poverty") {
          // Grab the x key and a version of the value formatted to show percentage
          theX = "<div>" + chosenXAxis + ": " + d[chosenXAxis] + "%</div>";
        }
        else {
          // Otherwise
          // Grab the x key and a version of the value formatted to include commas after every third digit.
          theX = "<div>" +
          chosenXAxis +
            ": " +
            parseFloat(d[chosenXAxis]).toLocaleString("en") +
            "</div>";
        }
        // Display what we capture.
        return theState + theX + theY;
      });
    // Call the toolTip function.
    svg.call(toolTip);

    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    // append x-axis
    var xAxis = chartGroup.append("g")
        // .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

      // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5")
     .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
        // Hover rules
        .on("mouseover", function(d) {
          // Show the tooltip
          toolTip.show(d, this);
          // Highlight the state circle's border
          d3.select(this).style("stroke", "#0a0a0a");
        })
        .on("mouseout", function(d) {
          // Remove the tooltip
          toolTip.hide(d);
          // Remove highlight
          d3.select(this).style("stroke", "#e3e3e3");
        })
        ;

    var circlesText = chartGroup.selectAll("g myCircleText")
        .data(censusData)
        .enter()
        .append("text")
      // We return the abbreviation to .text, which makes the text the abbreviation.
      .text(function(d) {
        return d.abbr;
      })
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis]) + 10 / 2.5)
      .attr("font-size", 10)
      .attr("class", "stateText");

  
        // Create group for two x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${margin.left}, ${height /4})`);


    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household income (Median)");

    var obeseLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - margin.left)
        .attr("y", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)");

    var smokeLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "2em")
        .attr("x", 0 - margin.left)
        .attr("y", 0 - (height / 2))
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", "3em")
        .attr("x", 0 - margin.left)
        .attr("y", 0 - (height / 2))
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    var linearRegression = d3.regressionLinear()
      .x(d => (d[chosenXAxis]))
      .y(d => (d[chosenYAxis]));
    
    var lr = linearRegression(censusData)

    let line = d3.line()
      .x(d => xLinearScale(d[0]))
      .y(d => yLinearScale(d[1]));

    var regressionLine = chartGroup.append("path")
      .datum(lr)
      .attr("stroke", "red")
      .attr("stroke-width", 2 + "px")
      .attr("d", line);

    var rSquaredText = chartGroup.append("text")
      .attr("x", width * 0.9)
      .attr("y", height * 0.9)
      .attr("font-family", "sans-serif")
      .attr("font-size", "24px")
      .text(`R²: ${lr.rSquared.toFixed(2)}`);


    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup, circlesText = renderCircles(circlesGroup, circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
        regressionLine = renderRegressionLine(censusData, regressionLine, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
        rSquaredText = renderRsquared(censusData, rSquaredText, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
    });
    

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup, circlesText = renderCircles(circlesGroup, circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)

        regressionLine = renderRegressionLine(censusData, regressionLine, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
        rSquaredText = renderRsquared(censusData, rSquaredText, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
        obeseLabel
            .classed("active", true)
            .classed("inactive", false);
        smokeLabel
            .classed("active", false)
            .classed("inactive", true);
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
        obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        smokeLabel
            .classed("active", true)
            .classed("inactive", false);
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
        obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        smokeLabel
            .classed("active", false)
            .classed("inactive", true);
        healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
    });


  }).catch(function(error) {
    console.log(error);
});
  