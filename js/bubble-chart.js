document.addEventListener('DOMContentLoaded', () => {
    // Set dimensions and margins
    const margin = {top: 40, right: 40, bottom: 60, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create SVG with margins
    const svg = d3.select("#bubble-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Load data
    d3.csv("./data/bubble-data.csv").then(data => {
      // Process data
      data.forEach(d => {
        d.Velocity_km_s = +d.Velocity_km_s;
        d.Distance_LD = +d.Distance_LD;
        d.Diameter_km = +d.Diameter_km;
        d.Hazardous = d.Hazardous === "true";
      });
  
      // Create scales
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Velocity_km_s) * 1.1])
        .range([0, width]);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Distance_LD) * 1.1])
        .range([height, 0]);
  
      const r = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Diameter_km)])
        .range([3, 30]);
  
      // Color scale
      const color = d3.scaleOrdinal()
        .domain([true, false])
        .range(["#e63946", "#457b9d"]);
  
      // Add initial hidden circles
      const circles = svg.selectAll(".bubble")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", width/2) // Start from center
        .attr("cy", height/2)
        .attr("r", 0) // Start with radius 0
        .attr("fill", d => color(d.Hazardous))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0); // Start invisible
  
      // Animate bubbles in
      circles.transition()
        .duration(1000)
        .delay((d,i) => i * 50) // Staggered appearance
        .attr("cx", d => x(d.Velocity_km_s))
        .attr("cy", d => y(d.Distance_LD))
        .attr("r", d => r(d.Diameter_km))
        .attr("opacity", 0.8)
        .ease(d3.easeElasticOut); // Bouncy effect
  
      // Add axes with transition
      const xAxis = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
  
      const yAxis = svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));
  
      // Animate axes
      xAxis.selectAll("line, path")
        .attr("stroke-opacity", 0)
        .transition().duration(800).attr("stroke-opacity", 1);
  
      yAxis.selectAll("line, path")
        .attr("stroke-opacity", 0)
        .transition().duration(800).attr("stroke-opacity", 1);
  
      // Add axis labels
      svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width/2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Velocity (km/s)");
  
      svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -margin.left + 20)
        .style("text-anchor", "middle")
        .text("Distance (Lunar Distance)");
  
      // Add interactive tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  
      circles.on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", r(d.Diameter_km) * 1.2)
            .attr("opacity", 1)
            .attr("stroke-width", 2.5);
  
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(`
            <strong>${d.Name}</strong><br>
            Diameter: ${d.Diameter_km} km<br>
            Distance: ${d.Distance_LD} LD<br>
            Velocity: ${d.Velocity_km_s} km/s<br>
            ${d.Hazardous ? "⚠️ Hazardous" : "✅ Non-Hazardous"}
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", d => r(d.Diameter_km))
            .attr("opacity", 0.8)
            .attr("stroke-width", 1.5);
  
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
  
    }).catch(error => {
      console.error("Error loading or processing data:", error);
    });
  });