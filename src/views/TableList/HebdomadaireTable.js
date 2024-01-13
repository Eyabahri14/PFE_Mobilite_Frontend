import React, { useState, useEffect } from 'react';
import './CalendarTable.css'; // Réutiliser le même fichier CSS
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFilePdf, FaFileCsv } from 'react-icons/fa';

const HebdomadaireTable = ({ selectedSensorIds, weeks }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;



 const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Capteur", "Valeur", "WeekNumber", "Station Point de Depart", "Station Direction"];
    const tableRows = [];

    tableData.forEach(entry => {
      const tableRow = [
        entry.capteur,
        entry.sumValeur,
        entry.weekNumber,
        entry.stationPointDeDepart,
        entry.stationDirection,
      ];
      tableRows.push(tableRow);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Weekly Table Data", 14, 15);
    doc.save(`weekly_table_data_${new Date().getTime()}.pdf`);
  };

  const exportCSV = () => {
    const csvRows = [];
    const headers = ["Capteur", "Valeur", "WeekNumber", "Station Point de Depart", "Station Direction"];
    csvRows.push(headers.join(","));

    tableData.forEach(entry => {
      const row = [
        entry.capteur,
        entry.sumValeur,
        entry.weekNumber,
        entry.stationPointDeDepart,
        entry.stationDirection,
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `weekly_table_data_${new Date().getTime()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sensorIds = selectedSensorIds.join(',');
        const weeksQuery = weeks.join(',');

        const response = await fetch(`http://localhost:3000/api/data/tableauWeekly/${sensorIds}?weeks=${weeksQuery}`);
        const data = await response.json();
        setTableData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weekly table data:", error);
        setLoading(false);
      }
    };

    if (selectedSensorIds.length && weeks.length) {
      fetchData();
    }
  }, [selectedSensorIds, weeks]);

  if (loading) {
    return <p>Loading weekly table data...</p>;
  }

  return (
    <div>

<div className="btn-group mb-3">
        <button className="btn btn-danger" onClick={exportPDF}>
          <FaFilePdf /> Export to PDF
        </button>
        <button className="btn btn-primary ml-2" onClick={exportCSV}>
          <FaFileCsv /> Export to CSV
        </button>
      </div>
      {tableData.length > 0 ? (
        <div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Capteur</th>
                <th>Valeur</th>
                <th>WeekNumber</th>
                <th>Station Point de Depart</th>
                <th>Station Direction</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index}>
                  <td>{item.capteur}</td>
                  <td>{item.sumValeur}</td>
                  <td>{item.weekNumber}</td>
                  <td>{item.stationPointDeDepart}</td>
                  <td>{item.stationDirection}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Ajoutez ici les boutons de pagination, si nécessaire */}
        </div>
      ) : (
        <p>No data available for the selected weeks.</p>
      )}
    </div>
  );
};

export default HebdomadaireTable;