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
  setEventList,
  setIsPopupVisible,
  setAssignedSeats,
} from "../../redux/feature/eventSlice";
import {
  getSeatByEventIdApi,
  getEventDataApi,
  getAllEventApi,
  updateEventApi,
} from "../../component/util/api";
import {
  Typography,
  Button,
  Autocomplete,
  TextField,
  Grid,
  Container,
  Paper,
  Box,
} from "@mui/material";
import SeatAssignmentPopup from "../../component/util/seatPopup";

const SeatAssign = () => {
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
    if (!eventId) {
      console.warn('No event ID selected');
      return;
    }
    try {
      const response = await getEventDataApi(eventId);
      if (response) {
        dispatch(setGuestData(JSON.parse(response)));
        getSeatByEventId();
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const getSeatByEventId = () => {
    if (!eventId) {
      console.warn('No event ID selected');
      return;
    }
    getSeatByEventIdApi(eventId).then((response) => {
      console.log('Seat data response:', response);
      if (response && response.seating_plan) {
        // Parse the seating plan if it's a string
        let seatingPlan;
        try {
          seatingPlan = typeof response.seating_plan === 'string' 
            ? JSON.parse(response.seating_plan) 
            : response.seating_plan;
        } catch (error) {
          console.error('Error parsing seating plan:', error);
          seatingPlan = [];
        }
        
        if (Array.isArray(seatingPlan) && seatingPlan.length > 0) {
          calculateAvailableSeats(seatingPlan);
        } else {
          console.warn('Invalid seating plan format or empty seating plan');
          dispatch(setSeats([]));
          dispatch(setSeatNo(0));
        }
      } else {
        console.warn('No seat data received or invalid format');
        dispatch(setSeats([]));
        dispatch(setSeatNo(0));
      }
    }).catch((error) => {
      console.error('Error fetching seat data:', error);
      dispatch(setSeats([]));
      dispatch(setSeatNo(0));
    });
  };

  const handleSelectionChange = (event, value) => {
    dispatch(setSelectedValues(value));
  };

  const handleAssign = () => {
    if (selectedValues.length === 0) {
      console.warn('No guests selected for assignment');
      return;
    }

    const totalGuestNum = selectedValues.reduce(
      (acc, guest) => acc + parseInt(guest.guest_num, 10),
      0
    );

    console.log('Assigning seats for', selectedValues.length, 'guests with total', totalGuestNum, 'people');

    // Reset assigned seats
    dispatch(setAssignedSeats([]));
    assignedSeatsRef.current = [];
    seatRef.current = seats;

    // Perform seat assignment
    assignSeats(seats, selectedValues, totalGuestNum);

    // Show the popup with assigned seats
    dispatch(setIsPopupVisible(true));

    // Update guest data to mark as checked
    const updatedGuestData = guestData.map((guest) => {
      const isSelected = selectedValues.some(
        (selected) => selected.ig === guest.ig
      );
      return isSelected ? { ...guest, checked: true, guest_num: "0" } : guest;
    });

    dispatch(setGuestData(updatedGuestData));
    dispatch(setSelectedValues([]));

    // Save changes to backend
    const request = {
      seatingPlan: seatRef.current,
      guestData: updatedGuestData,
    };
    
    // Use the API to update the event
    updateEventApi(eventId, request).then(() => {
      // Refresh the seat data
      getSeatByEventId();
    }).catch((error) => {
      console.error('Error updating event:', error);
    });
  };

  const calculateAvailableSeats = (seatingPlan) => {
    if (!seatingPlan || !Array.isArray(seatingPlan)) {
      console.log('Invalid seating plan:', seatingPlan);
      dispatch(setSeats([]));
      dispatch(setSeatNo(0));
      return;
    }

    console.log('Processing seating plan:', seatingPlan);

    // Check if this is a single house (array of rows) or multiple houses
    if (seatingPlan.length > 0 && seatingPlan[0].row) {
      // Single house - array of rows directly
      const singleHouseData = [{
        houseDisplay: 'Theater', // Default name
        seatInfo: seatingPlan
      }];
      processSeatingData(singleHouseData);
    } else if (seatingPlan.length > 0 && seatingPlan[0].seatInfo) {
      // Multiple houses with seatInfo structure
      processSeatingData(seatingPlan);
    } else {
      console.warn('Unknown seating plan structure');
      dispatch(setSeats([]));
      dispatch(setSeatNo(0));
    }
  };

  const processSeatingData = (seatingData) => {
    let totalAvailableSeats = 0;
    const updatedSeats = seatingData.map((house) => {
      const updatedHouse = { ...house };
      const seatRows = house.seatInfo || house;
      
      if (Array.isArray(seatRows)) {
        updatedHouse.seatInfo = seatRows.map((row) => {
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
      }
      return updatedHouse;
    });
    
    console.log('Updated seats:', updatedSeats);
    dispatch(setSeats(updatedSeats));
    dispatch(setSeatNo(totalAvailableSeats));
  };

  // Seat Assignment Algorithm Functions
  const isSeatAvailable = (seat) => {
    return !seat.reserved && !seat.disabled && !seat.marked;
  };

  const assignSeats = (seatingPlan, selectedValues, participants) => {
    let bestPlanScore = {
      bestScore: -1,
      bestPosition: null,
      index: 0,
      rowIndex: 0,
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
        selectedValues[0].extra || '',
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
            rateScore += parseInt(row.column[i].rate || 0);
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
        rowId < house.seatInfo.length && participants > 0;
        rowId++
      ) {
        const row = house.seatInfo[rowId];
        for (
          let col = 0;
          col < row.column.length && participants > 0;
          col++
        ) {
          if (isSeatAvailable(row.column[col])) {
            markSeat(
              row.column[col],
              selectedValues[0].ig,
              selectedValues[0].extra || '',
              row.row,
              house.houseDisplay
            );
            participants--;
          }
        }
      }
    }
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
    
    // Find the guest information for this assignment
    const assignedGuest = selectedValues.find(guest => guest.ig === displayValue);
    const guestInfo = assignedGuest ? {
      ig: assignedGuest.ig,
      tel: assignedGuest.tel || '',
      guest_num: assignedGuest.guest_num || '1'
    } : {};
    
    const updatedAssignedSeats = [...assignedSeatsRef.current, { 
      seatNo, 
      house, 
      extra,
      guest: guestInfo
    }];
    assignedSeatsRef.current = updatedAssignedSeats;
    dispatch(setAssignedSeats(updatedAssignedSeats));

    console.log(seatRef.current);
    const updatedSeats = seatRef.current.map((houseItem) => {
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

  useEffect(() => {
    getAllEventApi().then((response) => {
      if (response && response.results) {
        dispatch(setEventList(response.results));
      } else {
        dispatch(setEventList([]));
      }
    }).catch((error) => {
      console.error('Error fetching events:', error);
      dispatch(setEventList([]));
    });
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(guestData)) {
      const remainingGuests = guestData.filter((guest) => !guest.checked);
      dispatch(setGuestOptions(remainingGuests));
    } else {
      dispatch(setGuestOptions([]));
    }
  }, [guestData, dispatch]);

  useEffect(() => {
    dispatch(setGuestNo(Array.isArray(guestOptions) ? guestOptions.length : 0));
  }, [guestOptions, dispatch]);

  useEffect(() => {
    seatRef.current = seats;
  }, [seats]);

  useEffect(() => {
    assignedSeatsRef.current = assignedSeats;
  }, [assignedSeats]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Seat Assignment
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={4}>
            {/* Event Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Event
              </Typography>
              <form onSubmit={getEventData}>
                <Grid container spacing={2} alignItems="end">
                  <Grid item xs={12} sm={8}>
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
                            label="Select Event"
                            variant="outlined"
                          />
                        )}
                      />
                    ) : (
                      <Typography color="error">No events available</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                    >
                      Load Event Data
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>

            {/* Guest Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Guests
              </Typography>
              <Grid container spacing={2} alignItems="end">
                <Grid item xs={12} sm={8}>
                  <Autocomplete
                    multiple
                    fullWidth
                    value={selectedValues}
                    onChange={handleSelectionChange}
                    options={guestOptions}
                    getOptionLabel={(option) => {
                      return (
                        "Tel: " +
                        option.tel +
                        "; IG: " +
                        option.ig +
                        "; No of people: " +
                        option.guest_num
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Choose guests"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleAssign}
                    disabled={selectedValues.length === 0}
                  >
                    Assign Seats
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Statistics */}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {seatNo}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Seats Remaining
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {guestNo}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Guests Remaining
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <SeatAssignmentPopup />
      </Box>
    </Container>
  );
};

export default SeatAssign;
