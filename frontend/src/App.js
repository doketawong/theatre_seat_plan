import SeatingPlan from "./component/pages/SeatingPlan";
import { BrowserRouter as Router } from "react-router-dom";
import { formSubmit, fetchData } from "./component/util/utils";
import React, { useState } from "react";

import "./App.css";
import {
  Typography,
  Button,
  Autocomplete,
  TextField,
  Grid,
} from "@mui/material";

function App() {
  const [eventId, setEventId] = useState("");
  const [guestData, setGuestData] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
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
          updateEventSeatingPlan(eventId, seatingPlan);
        } else {
          seatingPlan = JSON.parse(result.seating_plan);
        }
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
  };

  const searchGuestList = (ig, tel) => {
    return (
      searchValue &&
      (ig.toLowerCase().includes(searchValue.toLowerCase()) ||
        tel.includes(searchValue))
    );
  };

  const handleAssign = () => {
    const totalGuestNum = selectedValues.reduce(
      (acc, guest) => acc + parseInt(guest.guest_num, 10),
      0
    );
    let seatingPlan = assignSeats(seat, selectedValues, totalGuestNum, 0, 0);

    updateEventSeatingPlan(eventId, seatingPlan);
  };

  const assignSeats = (
    seatingPlan,
    selectedValues,
    participants,
    row = 0,
    col = 0
  ) => {
    // Base case: if there are no more participants, return the seating plan
    if (participants === 0) {
      return seatingPlan;
    }

    // If we've run out of seats, throw an error
    if (row >= seatingPlan.length || col >= seatingPlan[0].length) {
      throw new Error("Not enough seats for all participants");
    }

    // Assign the first participant to the current seat
    if(seatingPlan[row].column[col].marked || seatingPlan[row].column[col].reserved || seatingPlan[row].column[col].disabled) {
      return assignSeats(seatingPlan, selectedValues, participants, row, col + 1);
    }
    seatingPlan[row].column[col].marked = true;
    seatingPlan[row].column[col].display = selectedValues.ig;
    console.log(seatingPlan[row].column[col]);

    // Move to the next seat
    let nextRow = row;
    let nextCol = col + 1;
    if (nextCol >= seatingPlan[0].length) {
      nextRow++;
      nextCol = 0;
    }

    // Recursively assign the rest of the participants
    return assignSeats(seatingPlan, selectedValues, --participants, nextRow, nextCol);
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedValues(newValue);
  };

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
          <Autocomplete
            multiple
            value={selectedValues}
            onChange={handleSelectionChange}
            options={guestData}
            getOptionLabel={(option) => option.tel} // Adjust according to your data structure
            renderInput={(params) => (
              <TextField {...params} label="Choose a guest" />
            )}
          />
          <Button variant="contained" onClick={handleAssign}>
            Assign seat
          </Button>
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
    body: JSON.stringify(seatingPlan),
  }).then((data) => {
    console.log("update success");
  });
}

export default AppWithRouter;
