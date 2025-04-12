/**
 * Line Chart Visualization
 * Created by: Ajit Behl
 * Student ID: 8973036
 * 
 * This script creates an interactive line chart using D3.js to visualize Canadian employment trends.
 * It allows users to compare employment data across provinces and sexes over time.
 */

// Define chart dimensions and margins
const margin = { top: 50, right: 150, bottom: 50, left: 70 },
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Define Canadian provinces for data filtering
const provinces = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
];

// Date parser for CSV data
const parseMonth = d3.timeParse("%Y-%m");

// Create SVG container with margins
const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initialize tooltip for hover interactions
const tooltip = d3.select("#tooltip");

// Create legend group positioned on the right side
const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 20}, 0)`);

// Global variable to store all CSV data
let allData = [];

// Initialize scales
const xScale = d3.scaleTime().range([0, width]); // Time-based x-axis
const yScale = d3.scaleLinear().range([height, 0]); // Linear y-axis

// Color scale for different provinces
const colorScale = d3.scaleOrdinal(d3.schemeSet2).domain(provinces);

// Create axis groups
const xAxisGroup = svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);
const yAxisGroup = svg.append("g").attr("class", "y-axis");

// Add axis labels
svg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .text("Year");

svg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .text("Employment (thousands)");

// Load and process CSV data
d3.csv("data/employment-in-canada.csv")
    .then((data) => {
        allData = data;

        // Set x-axis domain based on date range
        const dates = data.map((d) => parseMonth(d.month));
        xScale.domain(d3.extent(dates));

        // Draw initial axes
        xAxisGroup.call(d3.axisBottom(xScale).ticks(10));
        yAxisGroup.call(d3.axisLeft(yScale));

        // Add initial prompt text
        svg
            .append("text")
            .attr("id", "prompt")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "#555")
            .text("Please select province(s) and sex from the controls.");
    })
    .catch((error) => {
        console.error("Error loading CSV data:", error);
    });

// Set up event listeners for dropdown controls
d3.select("#sex-select").on("change", updateChart);
d3.select("#province-select1").on("change", updateChart);
d3.select("#province-select2").on("change", updateChart);

/**
 * Updates the chart based on user selections
 * This function handles:
 * - Filtering data based on selected sex and provinces
 * - Drawing new lines and data points
 * - Updating the legend
 * - Adding interactivity
 */
function updateChart() {
    // Clear existing chart elements
    svg.selectAll(".line").remove();
    svg.selectAll("circle").remove();
    svg.select("#prompt").remove();
    legend.selectAll("*").remove();

    // Get current selections from dropdowns
    const selectedSex = d3.select("#sex-select").property("value");
    const province1 = d3.select("#province-select1").property("value");
    const province2 = d3.select("#province-select2").property("value");

    // Build array of selected provinces
    let selectedProvinces = [];
    if (province1) selectedProvinces.push(province1);
    if (province2 && province2 !== province1) selectedProvinces.push(province2);

    // Show prompt if no provinces selected
    if (selectedProvinces.length === 0) {
        svg
            .append("text")
            .attr("id", "prompt")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "#555")
            .text("Please select at least one province.");
        return;
    }

    // Filter data based on selections
    const filteredRows = allData.filter(
        (d) => d.variable.trim() === "Employment" && d.sex.trim() === selectedSex
    );

    // Transform data into long format for selected provinces
    let longData = [];
    filteredRows.forEach((d) => {
        const date = parseMonth(d.month);
        selectedProvinces.forEach((prov) => {
            const val = +d[prov];
            if (!isNaN(val)) {
                longData.push({
                    date: date,
                    province: prov,
                    value: val,
                    month: d.month,
                });
            }
        });
    });

    // Group data by province
    const groupedData = d3
        .groups(longData, (d) => d.province)
        .map(([key, values]) => ({
            province: key,
            values: values.sort((a, b) => a.date - b.date),
        }));

    // Update y-axis scale and redraw
    yScale.domain([0, d3.max(longData, (d) => d.value) * 1.1]).nice();
    yAxisGroup.transition().duration(1000).call(d3.axisLeft(yScale));

    // Create line generator
    const lineGen = d3
        .line()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value));

    // Update legend
    groupedData.forEach((provGroup, i) => {
        const legendItem = legend
            .append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendItem
            .append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colorScale(provGroup.province));

        legendItem
            .append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(provGroup.province);
    });

    // Draw lines and data points
    groupedData.forEach((provGroup) => {
        const safeClassName = provGroup.province.replace(/[\s&]+/g, "-");

        // Draw animated line
        const path = svg
            .append("path")
            .datum(provGroup.values)
            .attr("class", `line ${safeClassName}`)
            .attr("d", lineGen)
            .style("stroke", colorScale(provGroup.province))
            .style("stroke-width", "1.5px")
            .style("opacity", 0.8);

        // Animate line drawing
        const totalLength = path.node().getTotalLength();
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Add interactive data points
        const circles = svg
            .selectAll(`circle.${safeClassName}`)
            .data(provGroup.values)
            .enter()
            .append("circle")
            .attr("class", safeClassName)
            .attr("r", 2)
            .attr("cx", (d) => xScale(d.date))
            .attr("cy", (d) => yScale(d.value))
            .attr("fill", colorScale(provGroup.province))
            .attr("opacity", 0)
            .on("mouseover", function (event, d) {
                tooltip
                    .style("opacity", 1)
                    .html(
                        `<strong>${d.province}</strong><br/><strong>Month:</strong> ${d.month}<br/><strong>Employment:</strong> ${d.value.toLocaleString()} thousand`
                    )
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });
    });
}