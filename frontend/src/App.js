import SeatingPlan from "./component/pages/SeatingPlan";
import { BrowserRouter as Router } from "react-router-dom";
import { formSubmit, fetchData } from "./component/util/utils";
import React, { useState } from "react";
import { createDefaultSeat } from "./component/type/seat.ts";

import "./App.css";

function App() {
  const [eventId, setEventId] = useState("");
  const [guestData, setGuestData] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [seat, setSeat] = useState(null);
  const [eventName, setEventName] = useState(null);
  let seatingPlan = {};

  const getEventData = (event) => {
    event.preventDefault();
    fetchData(`/getEvent/${eventId}`).then((data) => {
      if (data) {
        setGuestData(JSON.parse(data.guest_data));
      }
    });

    fetchData(`/getSeatByEventId/${eventId}`).then((data) => {
      let result = data.results[0];
      if (result) {
        setEventName(result.event_name);
        if (result.seating_plan == null) {
          seatingPlan = setDefaultSeatingPlan(JSON.parse(data.results[0].seat));
          updateEventSeatingPlan(eventId, seatingPlan);
        } else {
          seatingPlan = JSON.parse(result.seating_plan);
        }
        console.log(seatingPlan);
        setSeat(seatingPlan);
      }
    });
  };

  const handleCheck = (index) => {
    const newGuestData = [...guestData];
    newGuestData[index].checked = newGuestData[index].checked === "true" ? "false" : "true";
    setGuestData(newGuestData);
  };

  const handleButtonClick = () => {
    const checkedGuests = guestData.filter((guest) => guest.checked === "true");
    console.log(checkedGuests);
  };

  const searchGuestList = (ig, tel) => {
    return (
      searchValue &&
      (ig.toLowerCase().includes(searchValue.toLowerCase()) ||
        tel.includes(searchValue))
    );
  };

  return (
    <div className="App">
      <div>
        <form onSubmit={getEventData}>
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter event ID"
          />
          <button type="submit">Submit</button>
        </form>
      </div>
      <SeatingPlan seat={seat} eventName={eventName} eventId={eventId} />
      <div className="guestList">
        Guest List:{" "}
        <input
          value={searchValue}
          placeholder="search"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {guestData &&
          guestData.length > 0 &&
          guestData.map((guest, index) => (
            <div
              key={index}
              className={`guestItem ${
                searchGuestList(guest.ig, guest.tel) ? "highlight" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={guest.checked === "true"}
                onChange={() => handleCheck(index)}
              />
              {guest.tel} / {guest.guest_num}
            </div>
          ))}
        <button onClick={handleButtonClick}>sit down</button>
      </div>
    </div>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function updateEventSeatingPlan(eventId, seatingPlan) {
  formSubmit(`/updateEventSeatingPlan/${eventId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ seatingPlan: seatingPlan }),
  }).then((data) => {
    console.log('update success')
  });
}

function setDefaultSeatingPlan(seat) {
  let seatingPlan = { ...seat };
  Object.entries(seatingPlan).forEach(([key, row]) => {
    row.forEach((seat, index) => {
      seatingPlan[key][index] =
        seat == null ? null : createDefaultSeat(key + seat);
    });
  });
  return seatingPlan;
}

export default AppWithRouter;
