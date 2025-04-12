/**
 * Interactive Pie Chart Visualization
 * Created by: Hrishikesh Kindre
 * 
 * This script creates an interactive pie chart using D3.js to visualize categorical data.
 * Features include:
 * - Responsive design that adapts to container size
 * - Interactive hover effects on pie slices
 * - Dynamic labels and polylines
 * - Interactive legend with hover effects
 * - Smooth transitions and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set responsive dimensions based on container size
    const container = document.getElementById('pie-chart');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const diameter = Math.min(containerWidth, containerHeight) * 0.9;
    const radius = diameter / 2;
    
    // Create SVG container with responsive dimensions
    const svg = d3.select("#pie-chart")
      .append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .style("background-color", "transparent")
      .style("border", "none")
      .style("outline", "none")
      .style("box-shadow", "none")
      .append("g")
      .attr("transform", `translate(${radius}, ${radius})`);
  
    // Define color scale for pie slices
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    // Create pie layout generator
    const pie = d3.pie()
      .value(d => d.Value)
      .sort(null);
  
    // Create arc generators for pie slices and labels
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius * 0.8);
  
    const outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);
  
    // Load and process data
    d3.csv("data/pie-data.csv").then(function(data) {
      // Convert string values to numbers
      data.forEach(d => d.Value = +d.Value);
  
      // Generate pie chart data
      const pieData = pie(data);
  
      // Create pie slices
      const arcs = svg.selectAll(".arc")
        .data(pieData)
        .enter()
        .append("g")
        .attr("class", "arc");
  
      // Draw pie slices with styling
      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.Category))
        .attr("stroke", "#fff")
        .style("stroke-width", "2px")
        .style("opacity", 0.8);
  
      // Add polylines for labels (initially hidden)
      const polylines = arcs.append("polyline")
        .attr("class", "polyline")
        .attr("stroke", "#555")
        .style("fill", "none")
        .attr("stroke-width", "1px")
        .attr("points", function(d) {
          const posA = arc.centroid(d);
          const posB = outerArc.centroid(d);
          const posC = outerArc.centroid(d);
          posC[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
          return [posA, posB, posC];
        })
        .style("opacity", 0);
  
      // Add text labels (initially hidden)
      const labels = arcs.append("text")
        .attr("class", "label")
        .text(d => `${d.data.Category} (${d.data.Value}%)`)
        .attr("transform", function(d) {
          const pos = outerArc.centroid(d);
          pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        })
        .style("text-anchor", function(d) {
          return (midAngle(d)) < Math.PI ? "start" : "end";
        })
        .style("font-size", "12px")
        .style("fill", "#555")
        .style("opacity", 0);
  
      // Helper function to calculate mid angle of pie slice
      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }
  
      // Create interactive legend
      const legend = d3.select("#legend")
        .selectAll(".legend-item")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "legend-item");
  
      // Add color squares to legend
      legend.append("div")
        .attr("class", "legend-color")
        .style("background-color", d => color(d.Category));
  
      // Add text labels to legend
      legend.append("div")
        .text(d => `${d.Category} (${d.Value}%)`)
        .style("font-size", "14px")
        .style("color", "#333");
  
      // Add hover interactions to pie slices
      arcs.on("mouseover", function(event, d) {
        // Highlight selected slice
        d3.select(this).select("path").style("opacity", 1);
        d3.select(this).select(".polyline").style("opacity", 1);
        d3.select(this).select(".label").style("opacity", 1);
        
        // Highlight corresponding legend item
        legend.filter(ld => ld.Category === d.data.Category)
          .select("div:not(.legend-color)")
          .style("font-weight", "bold");
      })
      .on("mouseout", function(event, d) {
        // Reset slice appearance
        d3.select(this).select("path").style("opacity", 0.8);
        d3.select(this).select(".polyline").style("opacity", 0);
        d3.select(this).select(".label").style("opacity", 0);
        
        // Reset legend item
        legend.filter(ld => ld.Category === d.data.Category)
          .select("div:not(.legend-color)")
          .style("font-weight", "normal");
      });
  
      // Add hover interactions to legend items
      legend.on("mouseover", function(event, d) {
        const category = d.Category;
        // Highlight corresponding pie slice
        arcs.filter(arc => arc.data.Category === category)
          .select("path").style("opacity", 1);
        arcs.filter(arc => arc.data.Category === category)
          .select(".polyline").style("opacity", 1);
        arcs.filter(arc => arc.data.Category === category)
          .select(".label").style("opacity", 1);
      })
      .on("mouseout", function(event, d) {
        const category = d.Category;
        // Reset corresponding pie slice
        arcs.filter(arc => arc.data.Category === category)
          .select("path").style("opacity", 0.8);
        arcs.filter(arc => arc.data.Category === category)
          .select(".polyline").style("opacity", 0);
        arcs.filter(arc => arc.data.Category === category)
          .select(".label").style("opacity", 0);
      });
    });
  });