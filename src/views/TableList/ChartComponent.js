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
          const datesQuery = selectedDates.map((date) => `dates=${date}`).join('&');
          const url = `http://localhost:3000/api/data/dashboard/${sensorId}?${datesQuery}`;
          console.log('url renvoye par la requete', url);
          const response = await fetch(url);
          const data = await response.json();
          const dataPoints = data[0].map((entry) => {
            const year = parseInt(entry.Year, 10);
            const month = parseInt(entry.Month, 10) - 1;
            const day = parseInt(entry.Day, 10);
            const hour = parseInt(entry.Hour, 10);
            const minute = parseInt(entry.Minute, 10);
          
            // Check if the values are valid numbers
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
              console.error('Invalid date:', entry);
              return null;
            }
          
            const dateValue = new Date(year, month, day, hour, minute);
          
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
