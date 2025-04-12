/**
 * India Population Map Visualization
 * Created by: Ajit Behl & Lakhvinder Singh
 * 
 * This script creates an interactive choropleth map of India showing population distribution.
 * It allows users to switch between total population, male population, and female population views.
 */

// Create SVG container for the map
const svg = d3
.select("#map")
.append("svg")
.attr("width", 800)
.attr("height", 600);

// Create main group for map elements
const g = svg.append("g");

// Create tooltip for hover interactions
const tooltip = d3
.select("body")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// Define color schemes for different population types
const colorSchemes = {
total_population: ["#fee0a5", "#fdae61", "#f46d43", "#d73027"], // Orange to red
population_male: ["#deebf7", "#9ecae1", "#3182bd", "#08519c"], // Blue shades
population_female: ["#fde0dd", "#fa9fb5", "#f768a1", "#ae017e"], // Pink shades
};

// Initialize color scale
let currentColorScale = d3
.scaleQuantile()
.range(colorSchemes.total_population);

// Set up zoom behavior
const zoom = d3
.zoom()
.scaleExtent([1, 8])
.on("zoom", (event) => g.attr("transform", event.transform));
svg.call(zoom);

// Add zoom controls
document
.getElementById("zoom-in")
.addEventListener("click", () =>
  svg.transition().duration(750).call(zoom.scaleBy, 1.5)
);
document
.getElementById("zoom-out")
.addEventListener("click", () =>
  svg.transition().duration(750).call(zoom.scaleBy, 0.75)
);
document
.getElementById("reset")
.addEventListener("click", () =>
  svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity)
);

// Initialize data storage
let populationMap = {};
let geoData;

// Load and process data
d3.csv("data/state_wise_population__2019.csv")
.then((data) => {
  // Process population data
  data.forEach((d) => {
    populationMap[d.State.toUpperCase()] = {
      total_population: +d.total_population,
      population_male: +d.population_male,
      population_female: +d.population_female,
    };
  });
  // Load GeoJSON data
  return d3.json("./js/states_india.geojson");
})
.then((json) => {
  geoData = json;
  updateMap("total_population");
});

// Add event listener for population type selection
d3.select("#populationType").on("change", function () {
updateMap(this.value);
});

/**
 * Updates the map visualization based on selected population type
 * @param {string} type - The type of population data to display
 */
function updateMap(type) {
  // Update color scale based on selected type
  currentColorScale.range(colorSchemes[type]);
  currentColorScale.domain(
    Object.values(populationMap).map((d) => d[type])
  );

  // Create projection and path generator
  const projection = d3.geoMercator().fitSize([800, 600], geoData);
  const path = d3.geoPath().projection(projection);

  // Update map paths
  const paths = g.selectAll("path").data(geoData.features);

  paths
    .enter()
    .append("path")
    .merge(paths)
    .attr("class", "state")
    .attr("d", path)
    // Add hover interactions
    .on("mouseover", function (event, d) {
      const stateName = d.properties.st_nm.toUpperCase();
      const value = populationMap[stateName]?.[type] || 0;

      d3.select(this).style("stroke", "#333").style("stroke-width", 1.5);

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<strong>${d.properties.st_nm}</strong><br>${type.replace(
            "_",
            " "
          )}: ${value.toLocaleString()}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke", null);
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .transition()
    .duration(500)
    .style("fill", (d) => {
      const stateName = d.properties.st_nm.toUpperCase();
      const value = populationMap[stateName]?.[type] || 0;
      return currentColorScale(value);
    });

  // Remove any unused paths
  paths.exit().remove();

  // Update status message
  d3.select("#status-message")
    .text(`Showing ${type.replace("_", " ")} data`)
    .style("opacity", 1);

  // Hide status message after 2 seconds
  setTimeout(() => {
    d3.select("#status-message").style("opacity", 0);
  }, 2000);

  // Update legend colors
  d3.selectAll(".legend-color")
    .data(colorSchemes[type])
    .style("background", (d) => d);
}