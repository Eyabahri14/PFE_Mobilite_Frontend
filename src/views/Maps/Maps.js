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
  const [data, setData] = useState([]);

  useEffect(() => {
    const storedDates = JSON.parse(localStorage.getItem('selectedDates'));

    if (storedDates && storedDates.length > 0) {
      const datesQueryString = storedDates.join(',');
      fetch(`http://localhost:3000/api/data/capteursParDate?dates=${datesQueryString}`)
        .then(response => response.json())
        .then(fetchedData => {
          setData(fetchedData.map(item => ({
            ...item,
            value: item.TotalValeur
       
          })));
        })
        .catch(error => console.error('Error fetching data:', error));
    } else {
      Promise.all([
        fetch('http://localhost:3000/api/data/capteur').then(res => res.json()),
        fetch('http://localhost:3000/api/data/mesure').then(res => res.json())
      ]).then(([capteurs, mesures]) => {
        const combinedData = capteurs.map(capteur => {
          const mesure = mesures.find(m => m.id_capteur === capteur.id_capteur);
          return {
            ...capteur,
            value: mesure ? mesure.valeur : 0
          };
        });
        setData(combinedData);
      }).catch(error => console.error('Error fetching default data:', error));
    }
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const map = L.map("map").setView([47.312666, 5.041106], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
    }).addTo(map);

    const markers = L.markerClusterGroup();

  

    data.forEach(item => {
      const marker = L.marker([item.Capteur_lat, item.Capteur_long], { icon: DefaultIcon });
      marker.bindPopup(`<b>${item.Station_point_de_depart}</b><br>Valeur : ${item.value}`);
      console.log("valeur",item.value)
      markers.addLayer(marker);
    });



    map.addLayer(markers);

    L.Routing.control({
      waypoints: [
        L.latLng(47.312666, 5.041106),
        L.latLng(47.3266818, 5.053012893),
      ],
      geocoder: L.Control.Geocoder.nominatim(),
      fitSelectedRoutes: true,
    }).addTo(map);

  }, [data]);

  return <div id="map" style={{ height: "1000px" }}></div>;
};

export default Maps;



