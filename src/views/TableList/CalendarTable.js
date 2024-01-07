
import React, { useState, useEffect } from "react";
import "./CalendarTable.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaPrint, FaFilePdf } from 'react-icons/fa'; 

const CalendarTable = ({ selectedDates, selectedSensorIds }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Capteur", "Valeur", "Date", "Hour", "Minute", "Station Point de Depart", "Station Direction"];
    const tableRows = [];
  
    tableData.forEach(entry => {
      const tableRow = [
        entry.Capteur,
        entry.valeur,
        formatDate(entry.Date),
        entry.Hour,
        entry.Minute,
        entry.Station_point_de_depart,
        entry.Station_Direction,
      ];
      tableRows.push(tableRow);
    });
  
    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Table Data", 14, 15);
    doc.save(`table_data_${new Date().getTime()}.pdf`);
  };
  
  const exportCSV = () => {
    const csvRows = [];
    
    // En-tête CSV
    const headers = [
      "Capteur",
      "Valeur",
      "Date",
      "Hour",
      "Minute",
      "Station Point de Depart",
      "Station Direction",
    ];
    csvRows.push(headers.join(","));
  
    tableData.forEach((entry) => {
      const row = [
        entry.Capteur,
        entry.valeur,
        formatDate(entry.Date),
        entry.Hour,
        entry.Minute,
        entry.Station_point_de_depart,
        entry.Station_Direction,
      ];
      csvRows.push(row.join(","));
    });
  
    const csvContent = csvRows.join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
    const timestamp = new Date().getTime();
    const fileName = `table_data_${timestamp}.csv`;
  
    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute("download", fileName);
  
    downloadLink.click();
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sensorIds = selectedSensorIds.join(',');
  
        let url = `http://localhost:3000/api/data/tableau/${sensorIds}?Dates2=`;
        url += selectedDates.join('&');
  
        const response = await fetch(url);
        const data = await response.json();
        setTableData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching table data:", error);
        setLoading(false);
      }
    };
  
    if (selectedDates.length && selectedSensorIds.length) {
      fetchData();
    }
  }, [selectedDates, selectedSensorIds]);

  



  if (loading) {
    return <p>Loading table data...</p>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
       
      <div className="btn-group" role="group">
       
        <button className="btn btn-danger mr-4" onClick={exportPDF}>
          <FaFilePdf /> Export to PDF
        </button>
    
        <button className="btn btn-primary mr-4" onClick={exportCSV}>
          Export to CSV
        </button>
   
      
      </div>
      <h2>Table Data</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Capteur</th>
            <th>Valeur</th>
            <th>Date</th>
            <th>Hour</th>
            <th>Minute</th>
            <th>Station Point de Depart</th>
            <th>Station Direction</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((entry) => (
            <tr key={entry.Date}>
              <td>{entry.Capteur}</td>
              <td>{entry.valeur}</td>
              <td>{formatDate(entry.Date)}</td>
              <td>{entry.Hour}</td>
              <td>{entry.Minute}</td>
              <td>{entry.Station_point_de_depart}</td>
              <td>{entry.Station_Direction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(tableData.length / itemsPerPage)}>
        Next
      </button>
    </div>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

export default CalendarTable;