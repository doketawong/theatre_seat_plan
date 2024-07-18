import { BrowserRouter as Router } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  getSeatByEventIdApi,
  getEventDataApi,
  updateEventApi,
  getAllEventApi,
} from "./component/util/api";

import "./App.css";
import {
  Typography,
  Button,
  Autocomplete,
  TextField,
  Grid,
} from "@mui/material";

import SeatAssignmentPopup from "./component/util/seatPopup";
import SeatingPlanTab from "./component/pages/SeatingPlanTab";
import SeatingPlan from "./component/pages/SeatingPlan";
import UploadPage from "./component/pages/UploadEvent";

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
  const [event, setEvent] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [assignedSeats, setAssignedSeats] = useState([]);

  let seatingPlan = {};

  const getEventData = async (event) => {
    event.preventDefault();
    getEventDataApi(eventId).then((response) => {
      if (response) {
        setGuestData(JSON.parse(response));
        getSeatByEventId();
      }
    });
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
    getAllEventApi().then((response) => {
      setEvent(response.results);
    });
  }, []);

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
    getSeatByEventIdApi(eventId).then((response) => {
      if (response) {
        setEventName(response.event_name);
        setEventHouse(response.display_name);
        if (response.seating_plan == null) {
          const request = {
            seatingPlan: seatingPlan,
            guestData: guestData,
          };
          updateEventApi(eventId, request);
        } else {
          seatingPlan = JSON.parse(response.seating_plan);
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
    setAssignedSeats([]);
    let seatingPlan = assignSeats(seat, selectedValues, totalGuestNum, 0, 0);

    setIsPopupVisible(true); // Show the popup

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
    };
    updateEventApi(eventId, request);
  };

  const assignSeats = (seatingPlan, selectedValues, participants) => {
    let bestPlanScore = null;
    seatingPlan.forEach((plan, index) => {
      let bestSeat = null;

      for (let row = 0; row < plan.length; row++) {
        bestSeat = findSeatsAndCalculateScore(plan[row], participants, index);
      }

      if (bestSeat.bestScore > bestPlanScore.bestScore) {
        bestPlanScore = bestSeat;
      }
    });

    if (bestPlanScore.bestScore === 0) {
      distributeParticipantsAcrossSeats(
        seatingPlan[bestPlanScore.index],
        selectedValues,
        participants
      );
    } else {
      console.log(
        seatingPlan[bestPlanScore.index].column,
        bestPlanScore.bestPosition.start,
        bestPlanScore.bestPosition.end,
        selectedValues[0].ig,
        seatingPlan[bestPlanScore.index]
      );
      // markSeatsFromTo(
      //   seatingPlan[bestPlanScore.index].column,
      //   bestPlanScore.bestPosition.start,
      //   bestPlanScore.bestPosition.end,
      //   selectedValues[0].ig,
      //   seatingplan[bestPlanScore.index]
      // );
    }

    // return bestPlan;

    // // Try to seat participants in a single row.
    // for (let row = 0; row < seatingPlan.length; row++) {
    //   if (tryAssignSeatsInRow(seatingPlan[row], selectedValues, participants)) {
    //     return seatingPlan;
    //   }
    // }

    // // If unable to seat all participants together, distribute them across available seats.
    // distributeParticipantsAcrossSeats(
    //   seatingPlan,
    //   selectedValues,
    //   participants
    // );
    // return seatingPlan;
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
            selectedValues[0].ig,
            row.row
          );
          return true;
        }
      } else {
        seatsAvailable = 0; // Reset if a seat is not suitable
      }
    }
    return false;
  };

  const findSeatsAndCalculateScore = (row, participants, index) => {
    let bestScore = -1;
    let bestPosition = null;

    let seatsAvailable = 0;
    for (let col = 0; col < row.column.length; col++) {
      if (isSeatAvailable(row.column[col])) {
        seatsAvailable++;
        if (seatsAvailable === participants) {
          // Calculate score for this position
          // For simplicity, we're just using the column index as the score
          // You can replace this with a more complex calculation
          let score = col; // Example score calculation

          if (score > bestScore) {
            bestScore = score;
            bestPosition = { start: col - participants + 1, end: col };
          }

          // Reset seatsAvailable after finding a potential spot
          seatsAvailable = 0;
        }
      } else {
        seatsAvailable = 0; // Reset if a seat is not suitable
      }
    }

    return { bestScore, bestPosition, index };
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
          markSeat(
            seatingPlan[row].column[col],
            selectedValues[0].ig,
            seatingPlan[row].row
          );
          participants--;
        }
      }
    }
  };

  const isSeatAvailable = (seat) => {
    return !seat.reserved && !seat.disabled && !seat.marked;
  };

  const markSeatsFromTo = (seats, start, end, displayValue, row) => {
    for (let i = start; i <= end; i++) {
      markSeat(seats[i], displayValue, row);
    }
  };

  const markSeat = (seat, displayValue, row) => {
    seat.marked = true;
    seat.display = displayValue;
    const seatNo = `${row}${seat.column}`;
    setAssignedSeats((prev) => [...prev, seatNo]);
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedValues(newValue);
  };

  return (
    <div
      className="App"
      style={{
        // backgroundColor: "#000000",
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
                  {event && event.length > 0 ? (
                    <Autocomplete
                      fullWidth
                      options={event}
                      getOptionLabel={(option) => option.event_name}
                      value={event.find((item) => item.event_id === eventId)}
                      onChange={(event, newValue) => {
                        setEventId(newValue.event_id);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Event id"
                          InputProps={{
                            ...params.InputProps,
                            style: {
                              backgroundColor: "white", // Keep the background color as white
                            },
                          }}
                        />
                      )}
                    />
                  ) : (
                    <p>No event available</p>
                  )}
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
                getOptionLabel={(option) => {
                  return (
                    "tel: " +
                    option.tel +
                    "; IG: " +
                    option.ig +
                    "; email: " +
                    option.email
                  );
                }} // Adjust according to your data structure
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
              <SeatAssignmentPopup
                seats={assignedSeats}
                open={isPopupVisible}
                onClose={() => setIsPopupVisible(false)}
              />
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
          <SeatingPlanTab
            seatingData={seat}
            eventName={eventName}
            eventHouse={eventHouse}
          />
        </Grid>

        <Grid item xs={12}>
          <UploadPage />
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
