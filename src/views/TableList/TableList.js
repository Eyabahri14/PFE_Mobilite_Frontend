import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/fr";
import ChartComponent from "./ChartComponent";
import CalendarTable from "./CalendarTable";
import "./App.css";
import { FaPlus, FaTrash } from 'react-icons/fa';

moment.locale("fr");

const localizer = momentLocalizer(moment);

const messages = {
  today: "Aujourd'hui",
  next: "Suivant",
  previous: "Précédent",
  month: "Mois",
};

function App() {
  const [events] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [capteurs, setCapteurs] = useState([]);
  const [loadingCapteurs, setLoadingCapteurs] = useState(true);
  const [selectedSensorIds, setSelectedSensorIds] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setSelectedDates([...selectedDates, moment(slotInfo.start).format("YYYY-MM-DD")]);
    console.log("Selected Date:", slotInfo.start);
  };

  const handleAddDate = () => {
    const newDate = moment().add(1, "days").format("YYYY-MM-DD");
    setSelectedDates([...selectedDates, newDate]);
  };

  const handleSensorSelect = (e, index) => {
    const selectedSensorId = e.target.value;
    setSelectedSensorIds(prevSensorIds => {
      const newSelectedSensorIds = [...prevSensorIds];
      newSelectedSensorIds[index] = selectedSensorId;
      console.log("Selected Sensor IDs:", newSelectedSensorIds);
      return newSelectedSensorIds;
    });
  };




  const formatSelectedDates = () => {
    return selectedDates.map((date) => moment(date).format("YYYY-MM-DD"));
  };

  const slotPropGetter = (date) => {
    const isSelected = selectedDate && moment(date).isSame(moment(selectedDate), "day");
    return {
      className: isSelected ? "rbc-day-slot selected-day" : "rbc-day-slot",
    };
  };

  const handleAddSensorId = () => {
    // Check if there are available sensor IDs not already selected
    const availableSensorIds = capteurs.map((capteur) => capteur.id_capteur);
    const newSensorIds = availableSensorIds.filter((id) => !selectedSensorIds.includes(id));

    // If there are available sensor IDs, add the first one to selectedSensorIds
    if (newSensorIds.length > 0) {
      setSelectedSensorIds([...selectedSensorIds, newSensorIds[0]]);
    }
  };


  const handleRemoveDate = (dateToRemove) => {
    const updatedDates = selectedDates.filter((date) => date !== dateToRemove);
    setSelectedDates(updatedDates);
  };

  const handleRemoveSensor = (index) => {
    const updatedSensorIds = [...selectedSensorIds];
    updatedSensorIds.splice(index, 1);
    setSelectedSensorIds(updatedSensorIds);
  };

  // Définir la date par défaut sur janvier 2022
  const defaultDate = moment("2022-01-01").toDate();

  useEffect(() => {
    const fetchCapteurs = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/data/capteur");
        const data = await response.json();
        setCapteurs(data);
        setLoadingCapteurs(false);
      } catch (error) {
        console.error("Error fetching capteurs", error);
        setLoadingCapteurs(false);
      }
    };

    fetchCapteurs();
  }, []);

  return (
    <div className="App">
      <Calendar
        selectable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={["month"]}
        step={60}
        showMultiDayTimes
        defaultDate={defaultDate}
        onSelectSlot={handleSelectSlot}
        messages={messages}
        slotPropGetter={slotPropGetter}
      />

      {loadingCapteurs ? (
        <p>Loading capteurs...</p>
      ) : (
        selectedDate && (
          <div>
  <div className="form-group d-flex align-items-center">
    <h3 htmlFor="sensorSelect" className="MuiButton-label">
      Sélectionnez l'ID du capteur:
    </h3>

    {selectedSensorIds.map((selectedSensorId, index) => (
      <div key={index} className="d-flex align-items-center mb-2">
        <select
          className="form-control me-2"
          value={selectedSensorId}
          onChange={(e) => handleSensorSelect(e, index)}
        >
          {index === 0 && (
            <option value="" disabled>
              -- Choisissez un capteur --
            </option>
          )}
          {capteurs.map((capteur) => (
            <option key={capteur.id_capteur} value={capteur.id_capteur}>
              {capteur.id_capteur}
            </option>
          ))}
        </select>
        <button
          className="btn btn-secondary"
          onClick={() => handleRemoveSensor(index)}
        >
          <FaTrash />
        </button>
      </div>
    ))}
  </div>

  <div>
    <h3>Dates sélectionnées:</h3>
    {selectedDates.map((date) => (
      <div key={date} className="d-flex align-items-center mb-2">
        <span>{date}</span>
        <button
          className="btn btn-secondary ms-2"
          onClick={() => handleRemoveDate(date)}
        >
          <FaTrash />
        </button>
      </div>
    ))}
    <br />
    <button className="btn btn-primary" onClick={handleAddDate}>
      Ajouter une nouvelle date
    </button>

   <br/>
    <button className="btn btn-success ms-2 " onClick={handleAddSensorId}>
      <FaPlus />
    </button>
  </div>

  {selectedSensorIds.length > 0 && (
    <ChartComponent selectedDates={formatSelectedDates()} selectedSensorIds={selectedSensorIds} />
  )}
  {selectedSensorIds.length > 0 && (
    <CalendarTable selectedDates={formatSelectedDates()} selectedSensorIds={selectedSensorIds} />
  )}
</div>
        )
      )}
    </div>
  );
}

export default App;
