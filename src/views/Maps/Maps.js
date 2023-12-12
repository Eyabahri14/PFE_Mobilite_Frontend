// import React, { useEffect } from "react";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import "leaflet-routing-machine";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import "leaflet.markercluster/dist/MarkerCluster.css";
// import "leaflet.markercluster/dist/MarkerCluster.Default.css";
// import "leaflet.markercluster";
// import "leaflet-control-geocoder/dist/Control.Geocoder.css";
// import "leaflet-control-geocoder/dist/Control.Geocoder.js";
// import "./Maps.css";
// import Counters from "../../data/counters.json";
// import Mesures from "../../data/mesure.json";



// const DefaultIcon = L.icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
//   iconSize: [38, 38],
//   iconAnchor: [10, 41],
//   popupAnchor: [2, -40],
// });

// L.Marker.prototype.options.icon = DefaultIcon;



// function calculateColor(value, maxValue) {
//   const green = Math.min(255, Math.floor((1 - value / maxValue) * 255));
//   const red = Math.min(255, Math.floor((value / maxValue) * 255));
//   return `rgb(${red}, ${green}, 0)`;
// }

// const Maps = () => {
//   useEffect(() => {
//     const map = L.map("map").setView([47.312666, 5.041106], 13);

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
//     }).addTo(map);

//     const markers = L.markerClusterGroup({
//       iconCreateFunction: function (cluster) {
//         const markersInCluster = cluster.getAllChildMarkers();
//         let sum = 0;
//         markersInCluster.forEach((marker) => {
//           const counterId = marker.options.counterId;
//           const mesure = Mesures.find((m) => m.id_capteur === counterId);
//           if (mesure) {
//             sum += mesure.valeur;
//           }
//         });

//         const backgroundColor = calculateColor(sum, 1000); // 1000 est la valeur maximale (à adapter à vos données)
   
//         console.log(backgroundColor)

//         const clusterIcon = L.divIcon({
//           html: `${sum} nb/v/h </div>`,
//           iconSize: [36, 36],
//           iconAnchor: [18, 18],
//           className: "custom-cluster-icon",
//         });
        

//         return clusterIcon;
//       },
//     });

//     Counters.forEach((counterData) => {
//       const marker = L.marker([
//         counterData.controller_lat,
//         counterData.controller_long,
//       ]);
    
//       marker.options.counterId = counterData.id;
    
//       const mesure = Mesures.find((m) => m.id_capteur === counterData.id);
    
//       if (mesure) {
//         marker.bindPopup(`<b>${counterData.measuring_station}</b><br>Valeur : ${mesure.valeur} nb/v/h`);
//       } else {
//         marker.bindPopup(`<b>${counterData.measuring_station}</b><br>Pas de mesure disponible`);
//       }
    
//       markers.addLayer(marker);
//     });
    

//     map.addLayer(markers);

//     L.Routing.control({
//       waypoints: [
//         L.latLng(47.312666, 5.041106),
//         L.latLng(47.3266818, 5.053012893),
//       ],
//       geocoder: L.Control.Geocoder.nominatim(),
//       fitSelectedRoutes: true,
//     }).addTo(map);
//   }, []);

//   return <div id="map" className="map-container" />;
// };

// export default Maps;

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import "./Maps.css";
import Counters from "../../data/counters.json";
import Mesures from "../../data/mesure.json";
import "leaflet.heat"; // Import Heatmap Library

const DefaultIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
});

L.Marker.prototype.options.icon = DefaultIcon;

function calculateColor(value, minValue, maxValue) {
  // Calculate the color based on the value within the range
  const normalizedValue = (value - minValue) / (maxValue - minValue);
  const blue = Math.min(255, Math.floor(255 * (1 - normalizedValue)));
  const red = Math.min(255, Math.floor(255 * normalizedValue));
  return `rgb(${red}, 0, ${blue})`;
}
const Maps = () => {
  useEffect(() => {
    if (!Mesures || !Counters.length) return;

    const map = L.map("map").setView([47.312666, 5.041106], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
    }).addTo(map);
    const markers = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        const markersInCluster = cluster.getAllChildMarkers();
        let sum = 0;
        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        markersInCluster.forEach((marker) => {
          const counterId = marker.options.counterId;
          const mesure = Mesures.find((m) => m.id_capteur === counterId);
          if (mesure) {
            sum += mesure.valeur;
            minValue = Math.min(minValue, mesure.valeur);
            maxValue = Math.max(maxValue, mesure.valeur);
          }
        });

        const clusterIcon = L.divIcon({
          html: `${sum} nb/v/h`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: "custom-cluster-icon",
          // Set the background color based on the values
          style: `background-color: ${calculateColor(
            sum,
            minValue,
            maxValue
          )};`,
        });
        return clusterIcon;
      },
    });

    const clusterHeatData = []; // Data for cluster heatmap

    Counters.forEach((counterData) => {
      const marker = L.marker([
        counterData.controller_lat,
        counterData.controller_long,
      ]);
      marker.options.counterId = counterData.id;
      const mesure = Mesures.find((m) => m.id_capteur === counterData.id);
      if (mesure) {
        marker.bindPopup(
          `<b>${counterData.measuring_station}</b><br>Valeur : ${mesure.valeur} nb/v/h`
        );

        // Add the data for heatmap
        clusterHeatData.push([
          counterData.controller_lat,
          counterData.controller_long,
          mesure.valeur,
        ]);
      } else {
        marker.bindPopup(
          `<b>${counterData.measuring_station}</b><br>Pas de mesure disponible`
        );
      }
      markers.addLayer(marker);
    });

    // Create a heatmap layer for clusters
    L.heatLayer(clusterHeatData, { radius: 25 }).addTo(markers);
    map.addLayer(markers);

    L.Routing.control({
      waypoints: [
        L.latLng(47.312666, 5.041106),
        L.latLng(47.3266818, 5.053012893),
      ],
      geocoder: L.Control.Geocoder.nominatim(),
      fitSelectedRoutes: true,
    }).addTo(map);

  }, [Mesures]);

  return <div id="map" style={{ height: "1000px" }}></div>;
};

export default Maps;






