import SeatingPlan from "./component/pages/SeatingPlan";
import { BrowserRouter as Router } from "react-router-dom";
import { formSubmit, fetchData } from "./component/util/utils";
import React, { useEffect, useState } from "react";

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

    getSeatByEventId();
  };

  const getSeatByEventId = () => {
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

    const remainingGuests = selectedValues.filter((guest) => !guest.assigned);

    setSelectedValues(remainingGuests);

    updateEventSeatingPlan(eventId, seatingPlan);
  };

  const assignSeats = (
    seatingPlan,
    selectedValues,
    participants,
    row = 0,
    col = 0
  ) => {
    // Base case: No participants left to seat or no more rows available.
    if (participants <= 0 || row >= seatingPlan.length) {
      return seatingPlan;
    }

    // Check if there are enough consecutive seats in the current row
    let seatsAvailable = 0;
    for (
      let i = col;
      i < seatingPlan[row].column.length && seatsAvailable < participants;
      i++
    ) {
      if (
        !seatingPlan[row].column[i].reserved &&
        !seatingPlan[row].column[i].disabled &&
        !seatingPlan[row].column[i].marked
      ) {
        seatsAvailable++;
      } else {
        // Reset seatsAvailable if a seat is not suitable
        seatsAvailable = 0;
        col = i + 1;
      }
    }

    // If enough seats are available, assign them
    if (seatsAvailable === participants) {
      for (let i = 0; i < participants; i++) {
        seatingPlan[row].column[col + i].marked = true;
        seatingPlan[row].column[col + i].display = selectedValues[0].ig;
      }
      selectedValues[0].assigned = true;
      console.log("Assigned seats from row:", row, "starting column:", col);
      return seatingPlan;
    } else {
      // Move to the next row if not enough seats are available in the current row
      return assignSeats(seatingPlan, selectedValues, participants, row + 1, 0);
    }
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedValues(newValue);
  };

  const updateEventSeatingPlan = (eventId, seatingPlan) => {
    formSubmit(`/updateEventSeatingPlan/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(seatingPlan),
    }).then((data) => {
      getSeatByEventId();
      console.log("update success");
    });
  };

  return (
    <div className="App">
      <Grid container spacing={2} justifyContent="center">
        <Grid container item xs={6} alignItems="center" spacing={2}>
          <form onSubmit={getEventData}>
            <Grid container item xs={6} alignItems="center" spacing={2}>
              <Grid item xs={12} sm={8} md={9}>
                <TextField
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  variant="outlined"
                  placeholder="Enter event ID"
                  margin="normal"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button
                  type="submit"
                  variant="contained"
                  style={{ marginTop: "16px" }}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
        <Grid container item xs={6} alignItems="center" spacing={2}>
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
        <Grid item xs={12}>
          <SeatingPlan seat={seat} eventName={eventName} eventId={eventId} />
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

export default AppWithRouter;
