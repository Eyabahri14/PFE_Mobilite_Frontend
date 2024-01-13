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
import { FormControl, InputLabel, MenuItem, Select, Box } from "@mui/material";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaPrint, FaFilePdf } from 'react-icons/fa'; 


function BarChartComponent({ selectedSensorIds, onWeeksChange }) {
  const [weeks, setWeeks] = useState([1]);

  const [res, setRes] = useState([]);

  const exportToPdf = () => {
    const svgElement = document.querySelector('.recharts-surface');
    if (!svgElement) return;
  
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const DOMURL = window.URL || window.webkitURL || window;
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = DOMURL.createObjectURL(svgBlob);
  
    img.onload = () => {
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
      pdf.save('bar_chart.pdf');
    };
    img.src = url;
  };
  
  
  useEffect(() => {
    const fetchCapteurs = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/data/weeklyData/${selectedSensorIds}?weeks=${weeks.join(",")}`
        );
        const data = await response.json();
        setRes(data);
        
      } catch (error) {
        console.error("Error fetching capteurs", error);
      }
    };

    fetchCapteurs();

    onWeeksChange(weeks);

  }, [weeks, selectedSensorIds, onWeeksChange]);
  
  const formattedData = res.map((entry) => ({
    id_capteur: entry.id_capteur,
    DayOfWeek: entry.dayOfWeek,
    TotalValeur: entry.totalValues,
    WeekNumber: entry.weekNumber, 
  }));

  const filteredData = formattedData.filter((entry) => {
    return weeks.includes(parseInt(entry.WeekNumber, 10)); 
  });

  const transformedData = filteredData.reduce((acc, entry) => {
    const dayOfWeekKey = entry.DayOfWeek.toLowerCase();
    if (!acc[dayOfWeekKey]) {
      acc[dayOfWeekKey] = { DayOfWeek: entry.DayOfWeek };
    }
    acc[dayOfWeekKey][`TotalValeur_${entry.id_capteur}_${entry.WeekNumber}`] = entry.TotalValeur;
    return acc;
  }, {});

  return (
    <div>
          <button className="mr-4" onClick={exportToPdf}>Export to PDF</button>

      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Histogrammes Hebdomadaires</h2>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
        <FormControl sx={{ minWidth: 240 }} size="small">
          <InputLabel id="week-label">Choisis les semaines à afficher :</InputLabel>
          <Select
            labelId="week-label"
            id="week-select"
            multiple
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
          >
            {Array.from({ length: 48 }, (_, index) => index + 1).map((option) => (
              <MenuItem key={option} value={option}>
                Semaine {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>



      <div style={{ marginTop: '20px' }}> 


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
            weeks.map((week) => (
              <Bar
                key={`${sensorId}_${week}`}
                dataKey={`TotalValeur_${sensorId}_${week}`}
                fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
              />
            ))
          ))}
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BarChartComponent;