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
  
        const datesQuery = selectedDates.map((date) => `Dates2=${date}`).join('&');
        const sensorIdsQuery = selectedSensorIds.join(',');
        const url = `http://localhost:3000/api/data/dashboard/${sensorIdsQuery}?${datesQuery}`;
        console.log('url renvoyé par la requête', url);
        const response = await fetch(url);
        const data = await response.json();
  
    
        // Assurez-vous que data est défini et est un tableau avant de le parcourir
        if (Array.isArray(data)) {
          data.forEach((entry) => {
            const dateValue = new Date(`${entry.Hour}`);
  
            if (isNaN(dateValue.getTime())) {
              console.error('Invalid date:', entry);
              return null;
            }
  
            const formattedDate = format(dateValue, 'dd/MM/yyyy HH:mm');
           // console.log('Formatted date:', formattedDate);
  
            datasets.push({
              name: formattedDate,
              [selectedSensorIds[0]]: entry.valeur,
            });
  
            // Accédez aux valeurs spécifiques du premier élément du tableau (comme exemple)
            //console.log(`Axe des X: ${formattedDate}`);
            //console.log(`Axe des Y: ${entry.valeur}`);
          });
        } else {
          console.error('Data is not an array:', data);
        }
  
        setChartData([{ sensorId: selectedSensorIds[0], data: datasets }]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [selectedDates, selectedSensorIds]);
  
  useEffect(() => {
    // Log des valeurs après la mise à jour d'état
    //console.log('AxX values:', chartData.flatMap((dataset) => dataset.data.map((point) => point.name)));
    //console.log('AxY values:', chartData.flatMap((dataset) => dataset.data.map((point) => point[selectedSensorIds[0]]))); // Utilisez le premier sensorId comme exemple
    //console.log('Data values:', chartData.flatMap((dataset) => dataset.data.map((point) => ({ name: point.name, ...point }))));
  }, [chartData]);

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
          <XAxis dataKey="name" tickFormatter={(tick) => moment(tick).format('yyyy/MM/DD HH:mm')} interval="preserveStartEnd" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Legend />

          {selectedSensorIds.map((sensorId) => (
            <Line
              key={sensorId}
              type="monotone"
              dataKey={sensorId}
              stackId="1"
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;