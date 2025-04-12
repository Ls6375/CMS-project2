/**
 * Bar Chart Visualization
 * Created by: Lakhvinder Singh
 * Student ID: 8959531
 * 
 * This script creates an interactive bar chart using D3.js to visualize crime data.
 * It displays the top 20 crime categories by total cases for investigation.
 */

// Define chart dimensions and margins
const margin = { top: 50, right: 50, bottom: 150, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Load and process the crime data
d3.csv("data/crime_data.csv").then(function (data) {
    // Parse and sort the data
    const crimeData = data
        .map((d) => ({
            crime: d["Crime Head"],
            total_cases: +d["Total Cases for Investigation (Col.3+ Col.4+ Col.5)"],
        }))
        .sort((a, b) => b.total_cases - a.total_cases) // Sort data in descending order
        .slice(0, 20); // Take only the top 20 crime categories

    // Create SVG container with margins
    const svg = d3
        .select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create x-axis scale (categorical)
    const x = d3
        .scaleBand()
        .domain(crimeData.map((d) => d.crime))
        .range([0, width])
        .padding(0.1);

    // Create y-axis scale (linear)
    const y = d3
        .scaleLinear()
        .domain([0, d3.max(crimeData, (d) => d.total_cases)])
        .range([height, 0]);

    // Create tooltip for hover interactions
    const tip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(
            (d) =>
                `<strong>${d.crime}:</strong> ${d.total_cases.toLocaleString()}`
        )
        .style("font-size", "12px");

    svg.call(tip);

    // Create bars with transition animations
    svg
        .selectAll(".bar")
        .data(crimeData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.crime))
        .attr("width", x.bandwidth())
        .attr("y", height) // Start from the bottom
        .attr("height", 0) // Start with height 0
        .attr("fill", "steelblue")
        .on("mouseover", tip.show) // Show tooltip on hover
        .on("mouseout", tip.hide) // Hide tooltip on mouseout
        .transition() // Apply animation
        .duration(1000) // Animation duration
        .attr("y", (d) => y(d.total_cases))
        .attr("height", (d) => height - y(d.total_cases));

    // Add x-axis with rotated labels
    svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .style("font-size", "8px");

    // Add y-axis
    svg.append("g").call(d3.axisLeft(y)).style("font-size", "8px");

    // Add chart title
    svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Top 20 Total Cases for Investigation by Crime Category")
        .style("font-size", "16px");
});