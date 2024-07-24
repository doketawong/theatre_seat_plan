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
      let totalAvailableSeats = 0; // Accumulator for available seats
      const updatedSeats = seat.map((house) => {
        const updatedHouse = { ...house }; // Create a shallow copy to avoid direct mutation
        updatedHouse.seatInfo = house.seatInfo.map((row) => {
          let availableSeatCount = 0; // Counter for available seats in the current row
          const updatedRow = { ...row, column: [...row.column] }; // Shallow copy of row and column
          updatedRow.column.forEach((seatTemp) => {
            if (isSeatAvailable(seatTemp)) {
              availableSeatCount++;
            }
          });
          updatedRow.availableSeat = availableSeatCount; // Update availableSeat for the row
          totalAvailableSeats += availableSeatCount; // Add to total available seats
          return updatedRow;
        });
        return updatedHouse;
      });
      console.log("setSeatNo");
      setSeatNo(totalAvailableSeats); // Update state once with the total count
      // If you need to update the seat state with the modified structure, do it here
    }
  }, [seat, setSeat]);

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
        setSeat(seatingPlan);
      }
    });
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
      return isSelected ? { ...guest, checked: true, guest_num: "0" } : guest;
    });

    setSelectedValues([]);
    setGuestData(updatedGuestData);

    const request = {
      seatingPlan: seatingPlan,
      guestData: updatedGuestData,
    };
    updateEventApi(eventId, request);
    console.log("setSeat");
    getEventDataApi(eventId).then((response) => {
      if (response) {
        setGuestData(JSON.parse(response));
        getSeatByEventId();
      }
    });
  };

  const assignSeats = (seatingPlan, selectedValues, participants) => {
    let bestPlanScore = { bestScore: 0, bestPosition: null, index: 0 };
    seatingPlan.forEach((plan, index) => {
      let bestSeat = null;
      const houseRow = plan.seatInfo;
      for (let row = 0; row < houseRow.length; row++) {
        bestSeat = findSeatsAndCalculateScore(
          houseRow[row],
          participants,
          index,
          row,
          bestPlanScore.bestScore,
          houseRow.length
        );
        if (bestSeat && bestSeat.bestScore >= bestPlanScore.bestScore) {
          bestPlanScore = bestSeat;
        }
      }
    });

    if (bestPlanScore.bestScore === -1) {
      distributeParticipantsAcrossSeats(
        seatingPlan,
        selectedValues,
        participants
      );
    } else {
      const selectedHouse = seatingPlan[bestPlanScore.index];
      const selectedSeatingPlan = selectedHouse.seatInfo;
      const selectedRow = selectedSeatingPlan[bestPlanScore.rowIndex];
      const selectedHouseName = selectedHouse.houseDisplay;
      markSeatsFromTo(
        selectedRow.column,
        bestPlanScore.bestPosition.start,
        bestPlanScore.bestPosition.end,
        selectedValues[0].ig,
        selectedRow.row,
        selectedHouseName
      );
    }
    return seatingPlan;
  };

  const findSeatsAndCalculateScore = (
    row,
    participants,
    index,
    rowIndex,
    bestScore,
    houseRowLength
  ) => {
    let bestPosition = null;

    let seatsAvailable = 0;
    for (let col = 0; col < row.column.length; col++) {
      if (isSeatAvailable(row.column[col])) {
        seatsAvailable++;
        if (seatsAvailable === participants) {
          let score = houseRowLength - rowIndex;
          if (score >= bestScore) {
            bestScore = score;
            bestPosition = { start: col - participants + 1, end: col };
            return { bestScore, bestPosition, index, rowIndex };
          }
        }
      } else {
        seatsAvailable = 0; // Reset if a seat is not suitable
      }
    }
    return null;
  };

  const distributeParticipantsAcrossSeats = (
    seatingPlan,
    selectedValues,
    participants
  ) => {
    for (let houseId = 0; houseId < seatingPlan.length; houseId++) {
      const house = seatingPlan[houseId];
      for (
        let rowId = 0;
        rowId < house[houseId].length && participants > 0;
        rowId++
      ) {
        const row = house[houseId];
        for (
          let col = 0;
          col < row[rowId].column.length && participants > 0;
          col++
        ) {
          if (isSeatAvailable(row[rowId].column[col])) {
            markSeat(
              row[rowId].column[col],
              selectedValues[0].ig,
              row[rowId].row
            );
            participants--;
          }
        }
      }
    }
  };

  const isSeatAvailable = (seat) => {
    return !seat.reserved && !seat.disabled && !seat.marked;
  };

  const markSeatsFromTo = (
    seats,
    start,
    end,
    displayValue,
    row,
    selectedHouseName
  ) => {
    for (let i = start; i <= end; i++) {
      markSeat(seats[i], displayValue, row, selectedHouseName);
    }
  };

  const markSeat = (seat, displayValue, row, house) => {
    seat.marked = true;
    seat.display = displayValue;
    const seatNo = `${row}${seat.column}`;
    setAssignedSeats((prev) => [...prev, { seatNo, house }]);
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedValues(newValue);
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
            eventId={eventId}
            eventName={eventName}
            eventHouse={eventHouse}
            guest={guestData}
            setSeat={setSeat}
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
