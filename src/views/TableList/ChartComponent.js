import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0']; 


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = payload[0].color; 

    return (
      <div className={`custom-tooltip p-2 text-white`} style={{ backgroundColor: color, borderRadius: '0.25rem' }}>
        <p className="mb-1">{`Capteur ID: ${data.sensorId.split('-')[1]}`}</p>
        <p className="mb-1">{`Heure: ${data.name}`}</p>
        <p className="mb-1">{`Valeur: ${data.valeur}`}</p>
      </div>
    );
  }

  return null;
};

const ChartComponent = ({ selectedDates, selectedSensorIds }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let combinedData = [];

        for (const sensorId of selectedSensorIds) {
          for (const date of selectedDates) {
            const url = `http://localhost:3000/api/data/dashboard/${sensorId}?Dates2=${date}`;
            const response = await fetch(url);
            const data = await response.json();

            if (Array.isArray(data)) {

            const formattedData = data.map(entry => ({
    name: `${String(entry.Hour).padStart(2, '0')}:${String(entry.Minute).padStart(2, '0')}`,
    date: `${entry.Day}/${entry.Month}/${entry.Year} ${String(entry.Hour).padStart(2, '0')}:${String(entry.Minute).padStart(2, '0')}`,
    valeur: entry.valeur,
    sensorId: `sensor-${sensorId}-${date}`
  }));
               console.log(formattedData)
              combinedData = [...combinedData, ...formattedData];
            }
          }
        }

        setChartData(combinedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedDates, selectedSensorIds]);
  
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

return (
  <div>
    <h2>Dashboard</h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={500}
        height={300}
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} ticks={hours} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {selectedSensorIds.map((sensorId, index) => (
  selectedDates.map((date, dateIndex) => {
    const sensorDateId = `sensor-${sensorId}-${date}`;
    return (
      <Line
        key={sensorDateId}
        type="monotone"
        dataKey="valeur"
        data={chartData.filter(entry => entry.sensorId === sensorDateId)}
        stroke={colors[(index + dateIndex) % colors.length]}
        strokeWidth={3}
      />
    );
  })
))}

      </LineChart>
    </ResponsiveContainer>
  </div>
);
};

export default ChartComponent;