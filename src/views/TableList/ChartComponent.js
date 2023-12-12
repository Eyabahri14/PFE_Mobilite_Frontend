import React, { useEffect, useRef } from "react";
import moment from "moment";
import CanvasJSReact from "@canvasjs/react-charts";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const ChartComponent = ({ selectedDates, selectedSensorIds }) => {
  console.log("1", selectedSensorIds);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let yMin, yMax;
        const promisesMap = new Map();

        const promises = selectedSensorIds.map(async (sensorId) => {
          const datesQuery = selectedDates.map((date) => `dates=${date}`).join("&");
          const url = `http://localhost:3000/api/data/dashboard/${sensorId}?${datesQuery}`;

          const promise = fetch(url)
            .then(response => response.json())
            .then(data => {
              const allDataPoints = data.flatMap((sensorData) =>
                sensorData.map((entry) => ({
                  x: moment(`${entry.Year}-${entry.Month}-${entry.Day} ${entry.Hour}:${entry.Minute}`, "YYYY-MM-DD HH:mm").toDate(),
                  y: entry.valeur,
                })).sort((a, b) => a.x - b.x)
              );

              yMin = Math.min(...allDataPoints.map((point) => point.y));
              yMax = Math.max(...allDataPoints.map((point) => point.y));

              const dataPoints = data.flatMap((sensorData) =>
                sensorData.map((entry) => ({
                  x: moment(`${entry.Year}-${entry.Month}-${entry.Day} ${entry.Hour}:${entry.Minute}`, "YYYY-MM-DD HH:mm").toDate(),
                  y: entry.valeur,
                })).sort((a, b) => a.x - b.x)
              );

              return {
                type: "spline",
                name: `Capteur ${sensorId}`,
                showInLegend: true,
                legendText: `Capteur ${sensorId}`,
                dataPoints: dataPoints,
                axisYType: "secondary",
              };
            });

          promisesMap.set(sensorId, promise);
        });

        // Exclude the first sensor ID from the initial render
        const initialRender = chartRef.current === null;
        const startIdx = initialRender ? 1 : 0;
        const chartsData = await Promise.all(selectedSensorIds.slice(startIdx).map(sensorId => promisesMap.get(sensorId)));

        const options = {
          animationEnabled: true,
          title: {
            text: `Débit des Capteurs ${selectedSensorIds.join(",")} le ${selectedDates.join(", ")} `,
          },
          axisX: {
            title: "Time",
            valueFormatString: "HH:mm",
            type: "dateTime",
          },
          axisY: {
            title: "Values",
            minimum: yMin,
            maximum: yMax,
          },
          axisYType: "primary",
          legend: {
            cursor: "pointer",
            verticalAlign: "top",
            horizontalAlign: "center",
            dockInsidePlotArea: true,
          },
          data: chartsData,
        };

        chartRef.current = options;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedDates, selectedSensorIds]);

  return (
    <div>
      <h2>Dashboard</h2>
      {chartRef.current && <CanvasJSChart options={chartRef.current} />}
    </div>
  );
};

export default ChartComponent;
