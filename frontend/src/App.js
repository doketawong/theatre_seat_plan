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
  const [guestOptions, setGuestOptions] = useState([]); // [ { id: 1, ig: "name", tel: "123", guest_num: 1, checked: false }
  const [selectedValues, setSelectedValues] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [seat, setSeat] = useState(null);
  const [seatNo, setSeatNo] = useState(0);
  const [guestNo, setGuestNo] = useState(0);
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
  useEffect(() => {
    if (seat) {
      setSeatNo(0);
      seat.forEach((element) => {
        setSeatNo((prev) => prev + element.availableSeat);
      });
    }
  }, [seat]);

  useEffect(() => {
    if (guestData) {
      const remainingGuests = guestData.filter((guest) => !guest.checked);
      console.log(remainingGuests);
      setGuestOptions(remainingGuests);
    }
  }, [guestData]);

  useEffect(() => {
    if (guestOptions) {
      setGuestNo(guestOptions.length);
    }
  }, [guestOptions]);

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

    const updatedGuestData = guestData.map((guest) => {
      const isSelected = selectedValues.some(
        (selected) => selected.id === guest.id
      );
      return isSelected ? { ...guest, checked: true } : guest;
    });

    setSelectedValues([]);
    setGuestData(updatedGuestData);

    updateEventSeatingPlan(eventId, seatingPlan);
    updateEventParticipant(eventId, updatedGuestData);
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
      selectedValues[0].checked = true;
      seatingPlan[row].availableSeat -= participants;
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

  const updateEventParticipant = (eventId, participant) => {
    formSubmit(`/updateEventParticipant/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(participant),
    }).then((data) => {
      getSeatByEventId();
      console.log("update success");
    });
  };

  return (
    <div className="App">
      <Grid container justifyContent="center">
        <Grid container alignItems="center">
          <Grid item xs={12} sm={6}>
            <form onSubmit={getEventData}>
              <Grid container alignItems="center">
                <Grid item xs={12} sm={2}>
                  <Typography variant="h6">Event Id:</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={4}>
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
          <Grid
            container
            item
            xs={12}
            sm={6}
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h6">Guest List:</Typography>
            </Grid>
            <Grid item xs>
              <Autocomplete
                multiple
                value={selectedValues}
                onChange={handleSelectionChange}
                options={guestOptions}
                fullWidth
                getOptionLabel={(option) => option.tel} // Adjust according to your data structure
                renderInput={(params) => (
                  <TextField {...params} label="Choose a guest" fullWidth />
                )}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                style={{ marginTop: "16px" }}
                onClick={handleAssign}
              >
                Assign seat
              </Button>
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={12}
            sm={6}
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h6">
                Number of seat remain:{seatNo}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={12}
            sm={6}
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h6">
                Number of guest remain:{guestNo}
              </Typography>
            </Grid>
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
