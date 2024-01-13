import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip p-2" style={{ backgroundColor: 'white', borderRadius: '0.25rem', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.3)' }}>
        {payload.map((data, index) => (
          <div key={index} style={{ color: data.color }}>
            <p className="mb-1">{`Capteur ID: ${data.payload.sensorId.split('-')[1]}`}</p>
            <p className="mb-1">{`Date: ${data.payload.sensorId.split('-')[2]}`}</p>
            <p className="mb-1">{`Heure: ${data.payload.name}`}</p>
            <p className="mb-1">{`Valeur: ${data.payload.valeur}`}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const ChartComponent = ({ selectedDates, selectedSensorIds }) => {
  const [chartData, setChartData] = useState([]);

  const generateHourlyModel = () => {
    const model = [];
    selectedSensorIds.forEach(sensorId => {
      selectedDates.forEach(date => {
        for (let hour = 0; hour < 24; hour++) {
          const hourString = `${String(hour).padStart(2, '0')}`;
          model.push({
            name: hourString,
            date: `${date} ${hourString}`,
            valeur: 0,
            sensorId: `sensor-${sensorId}-${date}`,
            count: 0
          });
        }
      });
    });
    return model;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let combinedData = generateHourlyModel();

        for (const sensorId of selectedSensorIds) {
          for (const date of selectedDates) {
            const url = `http://localhost:3000/api/data/dashboard/${sensorId}?Dates2=${date}`;
            const response = await fetch(url);
            const data = await response.json();

            if (Array.isArray(data)) {
              data.forEach(entry => {
                const hourString = `${String(entry.Hour).padStart(2, '0')}`;
                const index = combinedData.findIndex(d => d.name === hourString && d.sensorId === `sensor-${sensorId}-${date}`);
                if (index !== -1) {
                  combinedData[index].valeur += entry.valeur;
                  combinedData[index].count += 1;
                }
              });
            }
          }
        }

        // Calcul de la moyenne pour chaque heure
        combinedData = combinedData.map(entry => ({
          ...entry,
          valeur: entry.count > 0 ? entry.valeur / entry.count : 0
        }));

        setChartData(combinedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

  }, [selectedDates, selectedSensorIds]);

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
          <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {selectedSensorIds.flatMap((sensorId, sensorIndex) =>
            selectedDates.map((date, dateIndex) => (
              <Line
                key={`sensor-${sensorId}-date-${date}`}
                type="monotone"
                dataKey="valeur"
                data={chartData.filter(entry => entry.sensorId === `sensor-${sensorId}-${date}`)}
                stroke={colors[(sensorIndex * selectedDates.length + dateIndex) % colors.length]}
                strokeWidth={2}
              />
            ))
          )}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;