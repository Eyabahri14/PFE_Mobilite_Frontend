
import React, { useState, useEffect } from "react";
import "./CalendarTable.css";

const CalendarTable = ({ selectedDate, selectedSensorId }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
        //  `http://localhost:3000/api/data/tableau/${selectedDate}/${selectedSensorId}`
        );
        const data = await response.json();
        setTableData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching table data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, selectedSensorId]);

  if (loading) {
    return <p>Loading table data...</p>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
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
