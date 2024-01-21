import React, { useState, useEffect } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FormControl, InputLabel, MenuItem, Select, Box, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaPrint, FaFilePdf } from 'react-icons/fa'; 


function MonthlyChart({ selectedSensorIds }) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [tmjmData, setTmjmData] = useState([]);
    const [tmjoData, setTmjoData] = useState([]);
    const [displayChoice, setDisplayChoice] = useState('Both');

    useEffect(() => {
        const fetchData = async () => {
            let newTmjmData = [];
            let newTmjoData = [];
    
            if (displayChoice === 'TMJM' || displayChoice === 'Both') {
                const tmjmResponse = await fetch(`http://localhost:3000/api/data/TMJM/${year}/${selectedSensorIds}`);
                newTmjmData = await tmjmResponse.json();
            }
    
            if (displayChoice === 'TMJO' || displayChoice === 'Both') {
                const tmjoResponse = await fetch(`http://localhost:3000/api/data/TMJO/${year}/${selectedSensorIds}`);
                newTmjoData = await tmjoResponse.json();
            }
    
            setTmjmData(newTmjmData);
            setTmjoData(newTmjoData);
        };
    
        fetchData().catch(console.error);
    }, [year, selectedSensorIds, displayChoice]);
    
    const combinedData = [];
    const allMonths = new Set([...tmjmData, ...tmjoData].map(data => data.Mois));
    
    allMonths.forEach(month => {
        const tmjmMonthData = tmjmData.find(d => d.Mois === month) || { MoyenneMensuelle: 0 };
        const tmjoMonthData = tmjoData.find(d => d.Mois === month) || { MoyenneMensuelle: 0 };
    
        combinedData.push({
            Mois: getMonthName(month),
            TMJM: tmjmMonthData.MoyenneMensuelle,
            TMJO: tmjoMonthData.MoyenneMensuelle
        });
    });
    

    function getMonthName(monthNumber) {
        const monthNames = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        return monthNames[monthNumber - 1];
    }



    console.log(tmjmData)

    return (
        <div>
            <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Histogrammes TMJM vs TMJO</h2>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <FormControl sx={{ minWidth: 240 }} size="small">
                    <InputLabel>Choisissez l'année :</InputLabel>
                    <Select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {Array.from({ length: 2024 - 2018 + 1 }, (_, index) => 2018 + index).map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <div className="mr-4"></div>
                <RadioGroup row value={displayChoice} onChange={(e) => setDisplayChoice(e.target.value)}>
                    <FormControlLabel value="TMJM" control={<Radio />} label="TMJM" />
                    <FormControlLabel value="TMJO" control={<Radio />} label="TMJO" />
                    <FormControlLabel value="Both" control={<Radio />} label="Les Deux" />
                </RadioGroup>
            </Box>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={combinedData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {(displayChoice === 'TMJM' || displayChoice === 'Both') && <Bar dataKey="TMJM" fill="#8884d8" name="TMJM" />}
                    {(displayChoice === 'TMJO' || displayChoice === 'Both') && <Bar dataKey="TMJO" fill="#82ca9d" name="TMJO" />}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default MonthlyChart;

