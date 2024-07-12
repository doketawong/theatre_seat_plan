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
  Grid
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
  const [eventHouse, setEventHouse] = useState(null); // [ { house_id: 1, house_name: "house1" }
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
        setEventHouse(result.display_name);
        if (result.seating_plan == null) {
          const request = {
            seatingPlan: seatingPlan,
            guestData: guestData,
          }
          updateEvent(eventId, request);
        } else {
          console.log(result.seating_plan);
          seatingPlan = JSON.parse(result.seating_plan);
          console.log(seatingPlan);
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
        (selected) => selected.ig === guest.ig
      );
      return isSelected ? { ...guest, checked: true } : guest;
    });

    setSelectedValues([]);
    setGuestData(updatedGuestData);

    const request = {
      seatingPlan: seatingPlan,
      guestData: updatedGuestData,
    }
    updateEvent(eventId, request);
  };

  const assignSeats = (seatingPlan, selectedValues, participants) => {
    // Try to seat participants in a single row.
    for (let row = 0; row < seatingPlan.length; row++) {
      if (tryAssignSeatsInRow(seatingPlan[row], selectedValues, participants)) {
        return seatingPlan;
      }
    }

    // If unable to seat all participants together, distribute them across available seats.
    distributeParticipantsAcrossSeats(
      seatingPlan,
      selectedValues,
      participants
    );
    return seatingPlan;
  };

  const tryAssignSeatsInRow = (row, selectedValues, participants) => {
    let seatsAvailable = 0;
    for (let col = 0; col < row.column.length; col++) {
      if (isSeatAvailable(row.column[col])) {
        seatsAvailable++;
        if (seatsAvailable === participants) {
          markSeatsFromTo(
            row.column,
            col - participants + 1,
            col,
            selectedValues[0].ig
          );
          return true;
        }
      } else {
        seatsAvailable = 0; // Reset if a seat is not suitable
      }
    }
    return false;
  };

  const distributeParticipantsAcrossSeats = (
    seatingPlan,
    selectedValues,
    participants
  ) => {
    for (let row = 0; row < seatingPlan.length && participants > 0; row++) {
      for (
        let col = 0;
        col < seatingPlan[row].column.length && participants > 0;
        col++
      ) {
        if (isSeatAvailable(seatingPlan[row].column[col])) {
          markSeat(seatingPlan[row].column[col], selectedValues[0].ig);
          participants--;
        }
      }
    }
  };

  const isSeatAvailable = (seat) => {
    return !seat.reserved && !seat.disabled && !seat.marked;
  };

  const markSeatsFromTo = (seats, start, end, displayValue) => {
    for (let i = start; i <= end; i++) {
      markSeat(seats[i], displayValue);
    }
  };

  const markSeat = (seat, displayValue) => {
    seat.marked = true;
    seat.display = displayValue;
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedValues(newValue);
  };

  const updateEvent = (eventId, event) => {
    formSubmit(`/updateEvent/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }).then((data) => {
      getSeatByEventId();
      console.log("update success");
    });
  };

  return (
    <div
      className="App"
      style={{
        backgroundColor: "#000000",
        color: "#fffff",
        // backgroundImage: "url('Twisters.jpeg')", // Update this path
        // backgroundSize: "cover", // Cover the entire page
        // backgroundPosition: "center", // Center the background image
        // backgroundRepeat: "no-repeat", // Do not repeat the image
      }}
    >
      <Grid container justifyContent="center">
        <Grid container alignItems="center">
          <Grid item xs={12} sm={6}>
            <form onSubmit={getEventData}>
              <Grid container alignItems="center">
                <Grid item xs={12} sm={2}>
                  <Typography variant="h6" style={{ color: "white" }}>
                    Event Id:
                  </Typography>
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
                    InputProps={{
                      style: {
                        backgroundColor: "white", // Background color changed to white
                      },
                    }}
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
              <Typography variant="h6" style={{ color: "white" }}>
                Guest List:
              </Typography>
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
                  <TextField
                    {...params}
                    label="Choose a guest"
                    fullWidth
                    style={{ backgroundColor: "white" }}
                  />
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
              <Typography variant="h6" style={{ color: "white" }}>
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
              <Typography variant="h6" style={{ color: "white" }}>
                Number of guest remain:{guestNo}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <SeatingPlan
            seat={seat}
            eventName={eventName}
            eventHouse={eventHouse}
            eventId={eventId}
          />
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
