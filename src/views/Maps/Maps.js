import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import "./Maps.css";
import "leaflet.heat";

const DefaultIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
});

L.Marker.prototype.options.icon = DefaultIcon;

function calculateColor(value, minValue, maxValue) {
  const normalizedValue = (value - minValue) / (maxValue - minValue);
  const blue = Math.min(255, Math.floor(255 * (1 - normalizedValue)));
  const red = Math.min(255, Math.floor(255 * normalizedValue));
  return `rgb(${red}, 0, ${blue})`;
}

const Maps = () => {
  const [mesures, setMesures] = useState([]);
  const [capteurs, setCapteurs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/data/mesure')
      .then(response => response.json())
      .then(data => setMesures(data));

    fetch('http://localhost:3000/api/data/capteur')
      .then(response => response.json())
      .then(data => setCapteurs(data));
  }, []);

  useEffect(() => {
    if (!mesures.length || !capteurs.length) return;

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
          const mesure = mesures.find((m) => m.id_capteur === counterId);
          if (mesure) {
            sum += mesure.valeur;
            minValue = Math.min(minValue, mesure.valeur);
            maxValue = Math.max(maxValue, mesure.valeur);
          }
        });

        return L.divIcon({
          html: `${sum} nb/v/h`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: "custom-cluster-icon",
          style: `background-color: ${calculateColor(sum, minValue, maxValue)};`,
        });
      },
    });

    const clusterHeatData = [];

    capteurs.forEach((capteur) => {
      const marker = L.marker([capteur.Capteur_lat, capteur.Capteur_long]);
      marker.options.counterId = capteur.id_capteur;
      const mesure = mesures.find((m) => m.id_capteur === capteur.id_capteur);
      if (mesure) {
        marker.bindPopup(`<b>${capteur.Station_point_de_depart}</b><br>Valeur : ${mesure.valeur} nb/v/h`);
        clusterHeatData.push([capteur.Capteur_lat, capteur.Capteur_long, mesure.valeur]);
      } else {
        marker.bindPopup(`<b>${capteur.Station_point_de_depart}</b><br>Pas de mesure disponible`);
      }
      markers.addLayer(marker);
    });

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

  }, [mesures, capteurs]);

  return <div id="map" style={{ height: "1000px" }}></div>;
};

export default Maps;






