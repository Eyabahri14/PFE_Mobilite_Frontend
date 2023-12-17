import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const ChartComponent = ({ selectedDates, selectedSensorIds }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const datasets = [];
    
        for (const sensorId of selectedSensorIds) {
          const datesQuery = selectedDates.map((date) => `Dates2=${date}`).join('&');
          const url = `http://localhost:3000/api/data/dashboard/${sensorId}?${datesQuery}`;
          console.log('url renvoye par la requete', url);
          const response = await fetch(url);
          const data = await response.json();
    
          console.log('Received data:', data); // Add this line
    
          const dataPoints = data.map((entry) => {
            const dateValue = new Date(entry.Date);
    
            // Check if the date is valid
            if (isNaN(dateValue.getTime())) {
              console.error('Invalid date:', entry);
              return null;
            }
    
            const formattedDate = format(dateValue, 'dd/MM/yyyy HH:mm');
    
            return {
              name: formattedDate,
              [sensorId]: entry.valeur,
            };
          });
    
          const filteredDataPoints = dataPoints.filter((entry) => entry !== null);
    
          datasets.push({
            sensorId: sensorId,
            data: filteredDataPoints,
          });
        }
    
        setChartData(datasets);
    
        // Ajoutez ces console.log pour voir les valeurs
        console.log('AxX values:', chartData.flatMap((dataset) => dataset.data.map((point) => point.name)));
        console.log('AxY values:', selectedSensorIds);
        console.log('Data values:', chartData.flatMap((dataset) => dataset.data.map((point) => ({ name: point.name, ...point }))));
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
          data={chartData.flatMap((dataset) => dataset.data)}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick) => moment(tick).format('DD/MM/YYYY HH:mm')} />
          <YAxis />
          <Tooltip />
          <Legend />

          {selectedSensorIds.map((sensorId) => (
            <Line
              key={sensorId}
              type="monotone"
              dataKey={sensorId}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
