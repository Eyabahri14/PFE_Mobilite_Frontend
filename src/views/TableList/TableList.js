import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/fr";
import ChartComponent from "./ChartComponent";
import CalendarTable from "./CalendarTable";
import "./App.css";
import { FaPlus, FaTrash } from "react-icons/fa";
import BarChartComponent from "./BarChart";
import HebdomadaireTable from "./HebdomadaireTable";

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
  const [selectedWeeks, setSelectedWeeks] = useState([]);

  const handleResetMaps = () => {
    localStorage.clear();
    setSelectedDates([]);
    setSelectedSensorIds([]);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    const newSelectedDates = [
      ...selectedDates,
      moment(slotInfo.start).format("YYYY-MM-DD"),
    ];
    setSelectedDates(newSelectedDates);
  
    localStorage.setItem('selectedDates', JSON.stringify(newSelectedDates));
  };
  

  const handleWeeksChange = (weeks) => {
    setSelectedWeeks(weeks);
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
      // Removed the call to fetchDataForSensors
      return newSelectedSensorIds;
    });
  };
  

  const formatSelectedDates = () => {
    return selectedDates.map((date) => moment(date).format("YYYY-MM-DD"));
  };

  const slotPropGetter = (date) => {
    const isSelected =
      selectedDate && moment(date).isSame(moment(selectedDate), "day");
    return {
      className: isSelected ? "rbc-day-slot selected-day" : "rbc-day-slot",
    };
  };

  const handleAddSensorId = () => {
    // Check if there are available sensor IDs not already selected
    const availableSensorIds = capteurs.map((capteur) => capteur.id_capteur);
    const newSensorIds = availableSensorIds.filter(
      (id) => !selectedSensorIds.includes(id)
    );

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
  const defaultDate = moment("2018-01-01").toDate();


  useEffect(() => {
    // Fetch capteurs data on component mount
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
       <button className="btn btn-danger mb-3" onClick={handleResetMaps}>
        Réinitialiser le Maps
      </button>
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
      <div>
      <div className="form-group mt-4 mb-4">
        <div className="d-flex align-items-center mb-3">
          <span className="text-label mr-3">Sélectionnez l'ID du capteur:</span>
          <button
            className="btn btn-success mr-3"
            onClick={handleAddSensorId}
          >
            <FaPlus />
          </button>
        </div>
    
        {selectedSensorIds.map((selectedSensorId, index) => (
          <div key={index} className="d-flex align-items-center mb-3">
            <select
              className="form-control mr-3"
              value={selectedSensorId}
              onChange={(e) => handleSensorSelect(e, index)}
              style={{ flex: 1 }}
            >
              {index === 0 && (
                <option value="" disabled>
                  -- Choisissez un capteur --
                </option>
              )}
              {capteurs.map((capteur) => (
                <option
                  key={capteur.id_capteur}
                  value={capteur.id_capteur}
                >
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
    
      <div className="date-selection mb-4">
        <span className="text-label mb-2 d-block">Dates sélectionnées:</span>
        {selectedDates.map((date) => (
          <div key={date} className="d-flex align-items-center mb-3">
            <span className="mr-3">{date}</span>
            <button
              className="btn btn-secondary"
              onClick={() => handleRemoveDate(date)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
        <button className="btn btn-primary mt-2" onClick={handleAddDate}>
          Ajouter une nouvelle date
        </button>
      </div>
    
      {selectedSensorIds.length > 0 && (
        <>
          <ChartComponent
            selectedDates={formatSelectedDates()}
            selectedSensorIds={selectedSensorIds}
          />
          <CalendarTable
            selectedDates={formatSelectedDates()}
            selectedSensorIds={selectedSensorIds}
          />
        </>
      )}
    </div>
    
    )}

    <BarChartComponent
      selectedSensorIds={selectedSensorIds}
      onWeeksChange={handleWeeksChange} 
    />
    
    <HebdomadaireTable
      selectedSensorIds={selectedSensorIds}
      weeks={selectedWeeks}
    />
  </div>
);

}

export default App;