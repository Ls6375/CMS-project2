/**
 * Stacked Area Chart Visualization
 * Created by: Divyangini Patel
 * Student ID: 8961573
 * 
 * This script creates a stacked area chart using D3.js to visualize GitHub language contributions
 * over time (2014-2023). It shows the relative popularity of different programming languages
 * in GitHub repositories.
 */

// Define chart dimensions and margins
const margin = {
    top: 30,
    right: 160,
    bottom: 40,
    left: 60,
},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// Create SVG container
const svg = d3
    .select("#stacked-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Add chart title
svg
    .append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text("GitHub Language Contributions (2014–2023)");

// Create main group for chart elements
const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process data
d3.csv("data/github_language_contributions.csv", d3.autoType).then(
    function (data) {
        // Extract language names from data columns
        const keys = data.columns.slice(1);

        // Create stack generator
        const stack = d3
            .stack()
            .keys(keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        // Generate stacked data
        const series = stack(data);

        // Create x-axis scale (time)
        const x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.Year))
            .range([0, width]);

        // Create y-axis scale (values)
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(series[series.length - 1], (d) => d[1])])
            .range([height, 0]);

        // Create area generator
        const area = d3
            .area()
            .x((d) => x(d.data.Year))
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]));

        // Define color scheme
        const colors = d3.schemeTableau10;

        // Draw stacked areas
        g.selectAll(".area")
            .data(series)
            .enter()
            .append("path")
            .attr("class", "area")
            .attr("fill", (d, i) => colors[i % colors.length])
            .attr("d", area);

        // Add x-axis
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(x).ticks(data.length).tickFormat(d3.format("d"))
            );

        // Add y-axis
        g.append("g").call(d3.axisLeft(y));

        // Create legend
        const legend = svg
            .append("g")
            .attr(
                "transform",
                `translate(${width + margin.left + 40},${margin.top})`
            );

        // Add legend rectangles
        legend
            .selectAll("rect")
            .data(keys)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d, i) => colors[i % colors.length]);

        // Add legend labels
        legend
            .selectAll("text")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", (d, i) => i * 20 + 12)
            .text((d) => d)
            .attr("alignment-baseline", "middle");
    }
);