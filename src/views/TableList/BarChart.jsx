import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function BarChartComponent({ selectedSensorIds }) {
  const [res, setRes] = useState([]);
  const [week, setWeek] = useState(1); // Default to the first week

  useEffect(() => {
    const fetchCapteurs = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/data/weeklyData/${selectedSensorIds}?weeks=${week}`
        );
        const data = await response.json();
        setRes(data);
      } catch (error) {
        console.error("Error fetching capteurs", error);
      }
    };

    fetchCapteurs();
  }, [week, selectedSensorIds]); // Include 'week' and 'selectedSensorIds' in the dependencies array

  const formattedData = res.map((entry) => ({
    id_capteur: entry.id_capteur,
    DayOfWeek: entry.dayOfWeek,
    TotalValeur: entry.totalValues,
  }));

  const filteredData = formattedData.filter((entry) => {
    // Ensure you have the correct days of the week to display in your chart
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Only include entries for the selected days of the week
    return daysOfWeek.includes(entry.DayOfWeek);
  });

  // Transform data to create separate entries for each sensor and include days of the week
  const transformedData = filteredData.reduce((acc, entry) => {
    const dayOfWeekKey = entry.DayOfWeek.toLowerCase(); // Convert to lowercase to match the XAxis labels
    if (!acc[dayOfWeekKey]) {
      acc[dayOfWeekKey] = { DayOfWeek: entry.DayOfWeek };
    }
    acc[dayOfWeekKey][`TotalValeur_${entry.id_capteur}`] = entry.TotalValeur;
    return acc;
  }, {});

  return (
    <div>
      <select
        value={week}
        onChange={(e) => setWeek(parseInt(e.target.value))}
      >
        {Array.from({ length: 48 }, (_, index) => index + 1).map((option) => (
          <option key={option} value={option}>
            Week {option}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          width={500}
          height={300}
          data={Object.values(transformedData)}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="DayOfWeek" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedSensorIds.map((sensorId) => (
            <Bar
              key={sensorId}
              dataKey={`TotalValeur_${sensorId}`}
              fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color for each sensor
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartComponent;
