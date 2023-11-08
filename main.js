import { select, json, geoPath, geoMercator } from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// Importing D3 and other modules reuired to draw the map
const svg = select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');
// selecting the SVG and defining the width and height of the svg

const projection = geoMercator().scale(1440).translate([width / 1.5, height / 0.248]);
const pathGenerator = geoPath().projection(projection);
// the geographic projection of the map with a scale and translation

const townSlider = document.getElementById('townSlider');
const townCountDisplay = document.getElementById('townCountDisplay');
// references to the HTML elements (townSlider and townCountDisplay)

// Modify the reloadTowns function to accept the town count as a parameter
function reloadTowns(townCount) {
// a function to reload towns based on the selected count

    json('https://raw.githubusercontent.com/ONSvisual/topojson_boundaries/master/geogNUTS2018UK.json')  
    .then(data => {
       const cities = topojson.feature(data, data.objects.nuts3);
    // fetching the geographic data from a URL
        const paths = svg.selectAll('path') // selecting the exising paths and binding data to them
            .data(cities.features);
        paths.enter().append('path')
            .attr('class', 'cities')
            .attr('d', d=> pathGenerator(d));
    });
    const url = `http://34.38.72.236/Circles/Towns/${townCount}`;

    // Fetch town data from the specified URL with the updated townCount
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(townData) {
            // Remove existing town circles
            svg.selectAll(".circle-points").remove();

            // Process and visualize the updated townData on top of the map
            svg.selectAll(".circle-points")
                .data(townData)
                .enter()
                .append("circle")
                .attr("class", "circle-points")
                .attr("cx", function(d) {
                    return projection([d.lng, d.lat])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.lng, d.lat])[1];
                })
                .attr("r", 3.5)
                .append('title')
                .text(function(d) {
                    return "County: " + d.County + "\nPopulation: " + d.Population + "\nTown: " + d.Town + "\nLat: " + d.lat + "\nLng: " + d.lng;
                });
        })
}


// Add an event listener to the slider to update the town count and reload the towns
townSlider.addEventListener('input', function() {
    const selectedValue = townSlider.value;
    townCountDisplay.textContent = selectedValue; // Update the displayed value
    reloadTowns(selectedValue); // Reload towns based on the selected value
});
// Adding a click event listener to the button to reload towns
document.getElementById("reloadButton").addEventListener("click", function(d){
    svg.selectAll(".circle-points").remove();
    reloadTowns(townSlider.value); // reloading towns with the current slider value
});

// Initial loading of towns
window.onload = function() {
    reloadTowns(50); // Initial town count value
};