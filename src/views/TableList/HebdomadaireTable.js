import React, { useState, useEffect } from 'react';
import './CalendarTable.css'; // Réutiliser le même fichier CSS
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';

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