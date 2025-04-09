import { BrowserRouter as Router } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setEventId,
  setGuestData,
  setGuestOptions,
  setSelectedValues,
  setSeats,
  setSeatNo,
  setGuestNo,
  setEventName,
  setEventHouse,
  setEventList,
  setAssignedSeats,
  setIsPopupVisible,
} from "./redux/feature/eventSlice";
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
  const dispatch = useDispatch();

  const {
    eventId,
    guestData,
    guestOptions,
    selectedValues,
    seats,
    seatNo,
    guestNo,
    eventList,
    assignedSeats,
  } = useSelector((state) => state.event);

  const seatRef = useRef(seats);
  const assignedSeatsRef = useRef(assignedSeats);

  const getEventData = async (event) => {
    event.preventDefault();
    getEventDataApi(eventId).then((response) => {
      if (response) {
        dispatch(setGuestData(JSON.parse(response)));
        getSeatByEventId();
      }
    });
  };
  useEffect(() => {
    assignedSeatsRef.current = assignedSeats;
  }, [assignedSeats]);

  useEffect(() => {
    if (seats) {
      let totalAvailableSeats = 0;
      const updatedSeats = seats.map((house) => {
        const updatedHouse = { ...house };
        updatedHouse.seatInfo = house.seatInfo.map((row) => {
          let availableSeatCount = 0;
          const updatedRow = { ...row, column: [...row.column] };
          updatedRow.column.forEach((seatTemp) => {
            if (!seatTemp.reserved && !seatTemp.disabled && !seatTemp.marked) {
              availableSeatCount++;
            }
          });
          updatedRow.availableSeat = availableSeatCount;
          totalAvailableSeats += availableSeatCount;
          return updatedRow;
        });
        return updatedHouse;
      });
      dispatch(setSeatNo(totalAvailableSeats));
    }
  }, [seats, dispatch]);

  useEffect(() => {
    getAllEventApi().then((response) => {
      dispatch(setEventList(response.results));
    });
  }, [dispatch]);

  useEffect(() => {
    const remainingGuests = guestData.filter((guest) => !guest.checked);
    dispatch(setGuestOptions(remainingGuests));
  }, [guestData, dispatch]);

  useEffect(() => {
    dispatch(setGuestNo(guestOptions.length));
  }, [guestOptions, dispatch]);

  const calculateAvailableSeats = (seatingPlan) => {
    const updatedSeatingPlan = seatingPlan.map((house) => {
      const updatedHouse = { ...house };
      updatedHouse.seatInfo = house.seatInfo.map((row) => {
        let availableSeatCount = 0;
        const updatedRow = { ...row, column: [...row.column] };
        updatedRow.column.forEach((seat) => {
          if (isSeatAvailable(seat)) {
            availableSeatCount++;
          }
        });
        updatedRow.availableSeat = availableSeatCount;
        return updatedRow;
      });
      return updatedHouse;
    });

    const totalAvailableSeats = updatedSeatingPlan.reduce((acc, house) => {
      return (
        acc +
        house.seatInfo.reduce((rowAcc, row) => rowAcc + row.availableSeat, 0)
      );
    }, 0);

    dispatch(setSeats(updatedSeatingPlan));
    dispatch(setSeatNo(totalAvailableSeats));
  };

  const getSeatByEventId = () => {
    getSeatByEventIdApi(eventId).then((response) => {
      if (response) {
        dispatch(setEventName(response.event_name));
        dispatch(setEventHouse(response.display_name));

        let seatingPlan = response.seating_plan
          ? JSON.parse(response.seating_plan)
          : [];
        if (!response.seating_plan) {
          const request = {
            seatingPlan: seatingPlan,
            guestData: guestData,
          };
          updateEventApi(eventId, request);
        }
        calculateAvailableSeats(seatingPlan);
      }
    });
  };

  const handleAssign = () => {
    const totalGuestNum = selectedValues.reduce(
      (acc, guest) => acc + parseInt(guest.guest_num, 10),
      0
    );

    dispatch(setAssignedSeats([]));
    assignedSeatsRef.current = [];
    assignSeats(seats, selectedValues, totalGuestNum);

    dispatch(setIsPopupVisible(true)); // Show the popup

    const updatedGuestData = guestData.map((guest) => {
      const isSelected = selectedValues.some(
        (selected) => selected.ig === guest.ig
      );
      return isSelected ? { ...guest, checked: true, guest_num: "0" } : guest;
    });

    dispatch(setGuestData(updatedGuestData));
    dispatch(setSelectedValues([]));

    const request = {
      seatingPlan: seatRef.current,
      guestData: updatedGuestData,
    };
    updateEventApi(eventId, request);
    getEventDataApi(eventId).then((response) => {
      if (response) {
        getSeatByEventId();
      }
    });
  };

  const assignSeats = (seatingPlan, selectedValues, participants) => {
    let bestPlanScore = {
      bestScore: -1,
      bestPosition: null,
      index: 0,
      bestRateScore: 4,
    };

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
        if (
          bestSeat &&
          (bestSeat.bestRateScore > bestPlanScore.bestRateScore ||
            bestSeat.bestScore > bestPlanScore.bestScore)
        ) {
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
        selectedValues[0].extra,
        selectedRow.row,
        selectedHouseName
      );
    }
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
    let bestRateScore = 0;

    let seatsAvailable = 0;
    for (let col = 0; col < row.column.length; col++) {
      if (isSeatAvailable(row.column[col])) {
        seatsAvailable++;
        if (seatsAvailable === participants) {
          let score = houseRowLength - rowIndex;
          let rateScore = 0;

          // Calculate the sum of rates for the seats in the range
          for (let i = col - participants + 1; i <= col; i++) {
            rateScore += parseInt(row.column[i].rate);
          }
          if (
            rateScore > bestRateScore ||
            (rateScore === bestRateScore && score >= bestScore)
          ) {
            bestRateScore = rateScore;
            bestScore = score;
            bestPosition = { start: col - participants + 1, end: col };
          }
        }
      } else {
        seatsAvailable = 0; // Reset if a seat is not suitable
      }
    }
    return { bestScore, bestPosition, index, rowIndex, bestRateScore };
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
    extra,
    row,
    selectedHouseName
  ) => {
    for (let i = start; i <= end; i++) {
      markSeat(seats[i], displayValue, extra, row, selectedHouseName);
    }
  };

  const markSeat = (seat, displayValue, extra, row, house) => {
    const seatNo = `${row}${seat.column}`;
    const updatedAssignedSeats = [...assignedSeatsRef.current, { seatNo, house, extra }]; // Use the current state to create a new array
    dispatch(setAssignedSeats(updatedAssignedSeats)); // Dispatch the updated array

    const updatedSeats = seats.map((houseItem) => {
      // Check if the house matches
      if (houseItem.houseDisplay === house) {
        return {
          ...houseItem,
          seatInfo: houseItem.seatInfo.map((rowItem) => {
            // Check if the row matches
            if (rowItem.row === row) {
              return {
                ...rowItem,
                column: rowItem.column.map((colItem) => {
                  // Check if the seat matches
                  if (colItem.column === seat.column) {
                    return {
                      ...colItem,
                      marked: true,
                      display: displayValue,
                    };
                  }
                  return colItem; // Return other seats unchanged
                }),
              };
            }
            return rowItem; // Return other rows unchanged
          }),
        };
      }
      return houseItem; // Return other houses unchanged
    });

    dispatch(setSeats(updatedSeats));
    seatRef.current = updatedSeats;
  };

  const handleSelectionChange = (event, newValue) => {
    dispatch(setSelectedValues(newValue));
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
                  {eventList && eventList.length > 0 ? (
                    <Autocomplete
                      fullWidth
                      options={eventList}
                      getOptionLabel={(option) => option.event_name}
                      value={eventList.find(
                        (item) => item.event_id === eventId
                      )}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          dispatch(setEventId(newValue.event_id));
                        }
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
              <SeatAssignmentPopup />
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
          <SeatingPlanTab />
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
