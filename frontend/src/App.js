import SeatingPlan from "./component/pages/SeatingPlan";
import { BrowserRouter as Router } from "react-router-dom";
import { formSubmit, fetchData } from "./component/util/utils";
import React, { useState } from "react";
import { createDefaultSeat } from "./component/type/seat.ts";

import "./App.css";
import { Typography, Button, Checkbox, TextField, Grid } from "@mui/material";

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
    newGuestData[index].checked =
      newGuestData[index].checked === "true" ? "false" : "true";
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

  const handleAssign = () => {
    const checkedGuests = guestData.filter((guest) => guest.checked === "true");
    let participants = checkedGuests.map((guest) => guest.tel);
    let seatingPlan = setDefaultSeatingPlan(seat);
    console.log(seatingPlan);
    console.log(participants);
    updateEventSeatingPlan(eventId, seatingPlan);
  }

  return (
    <div className="App">
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={6}>
          <form onSubmit={getEventData}>
            <TextField
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              variant="outlined"
              placeholder="Enter event ID"
              margin="normal"
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              style={{ marginTop: "16px" }}
            >
              Submit
            </Button>
          </form>
        </Grid>
        <Grid item xs={12}>
          <SeatingPlan seat={seat} eventName={eventName} eventId={eventId} />
        </Grid>
        <Grid item xs={12} sm={6} justifyContent="center">
          <Typography variant="h6">Guest List:</Typography>
          <TextField
            value={searchValue}
            placeholder="search"
            onChange={(e) => setSearchValue(e.target.value)}
            margin="normal"
            variant="outlined"
            fullWidth
          />
          {guestData &&
            guestData.length > 0 &&
            guestData.map((guest, index) => (
              <Grid container key={index} alignItems="center">
                <Grid item xs={1}>
                  <Checkbox
                    checked={guest.checked === "true"}
                    onChange={() => handleCheck(index)}
                  />
                </Grid>
                <Grid item xs={11}>
                  <Typography>
                    {guest.tel} / {guest.guest_num}
                  </Typography>
                </Grid>
              </Grid>
            ))}
            <Button variant="contained" onClick={handleAssign}>Assign seat</Button>
        </Grid>
      </Grid>
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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ seatingPlan: seatingPlan }),
  }).then((data) => {
    console.log("update success");
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
