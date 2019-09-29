// Leaflet Homework - Visualizing Data with Leaflet

// custom icon for quake
var quakeIcon = new L.Icon({
    iconUrl: './static/images/marker-icon-ql.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

// Adding tile layer to the map
var streets = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
});

var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
});

var baseMaps = {
    Streets: streets,
    Light: light,
    Dark: dark
};



// Creating map object
var myMap = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 8,
    layers: dark
});

// colors for magnitude
var colors = [
    '#ffffee',
    '#ffffcc',
    '#ffeda0',
    '#fed976',
    '#feb24c',
    '#fd8d3c',
    '#fc4e2a',
    '#e31a1c',
    '#bd0026',
    '#800026'
];

// Function to assign color depends on the Magnitude
function pickQuakeColor(magnitude) {
    return magnitude > 9 ? colors[5] :
        magnitude > 8 ? colors[4] :
            magnitude > 7 ? colors[3] :
                magnitude > 6 ? colors[2] :
                    magnitude > 5 ? colors[5] :
                        magnitude > 4 ? colors[4] :
                            magnitude > 3 ? colors[3] :
                                magnitude > 2 ? colors[2] :
                                    magnitude > 1 ? colors[1] :
                                        colors[0];
};

// url for all earthquakes last 7 days
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var markers = L.layerGroup();
var circles = L.layerGroup();

// grab the data with d3
d3.json(url, function (response) {
     console.log(response);

    // add response to map
    // circle radius * mag, color[mag]
    circles.addLayer(L.geoJson(response, {
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng,
                {
                    radius: ((Math.exp(feature.properties.mag / 1.01 - 0.13)) * 1000),
                    fillColor: pickQuakeColor(feature.properties.mag),
                    fillOpacity: .8,
                    color: '#eeeeee',
                    weight: 0
                });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h1>${feature.properties.title}</h1><h2>Magnitude:${feature.properties.mag}</h2><h3><a href="${feature.properties.url}">(more...)</a></h3>`);
        }
    }));

    markers.addLayer(L.geoJson(response, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: quakeIcon });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h1>${feature.properties.title}</h1><h2>Magnitude:${feature.properties.mag}</h2><h3><a href="${feature.properties.url}">(more...)</a></h3>`);
        }
    }));

    // add in techtonic plate boundry layer, double stroke for easy viewing on light or dark background
      var plates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (plateData) {
    L.geoJSON(plateData,
      {
        color: 'darkblue',
        weight: 4
      })
      .addTo(plates);
      L.geoJSON(plateData,
        {
          color: 'lightblue',
          weight: 2
        })
        .addTo(plates);
  });   

    myMap.addLayer(plates);
    myMap.addLayer(markers);
    myMap.addLayer(circles);

    var overlayMaps = {
        "Techtonic Plates": plates,
        "Quake Epicenter": markers,
        "Representation of Magnitude": circles
    };

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
    L.control.locate().addTo(myMap);

    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'legend'),
      labels = ['<h3>Magnitude</h3>'],
      categories = ["< 0", "< 1", "< 2", "< 3", "< 4", "< 5", "< 6", "< 7", "< 8", "< 9"];
  
      for (var i = 0; i < categories.length; i++) {
        labels.push(
            '<p><i style="background:' + colors[i] + '"></i> ' + categories[i] + "</p>");
      }
      div.innerHTML = labels.join('');
      return div;
    };
    legend.addTo(myMap);
});

