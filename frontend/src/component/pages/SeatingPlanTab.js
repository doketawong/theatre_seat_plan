import { useState } from "react";
import { Tabs, Tab, Box, Grid, Button, Chip, Typography, Slider, TextField } from "@mui/material";
import SeatingPlan from "./SeatingPlan"; // Assuming this is your seating plan component
import { updateEventApi } from "../util/api";
import { useSelector, useDispatch } from "react-redux";
import {
  setSeats
} from "../../redux/feature/eventSlice"; // Adjust the import path as necessary

const SeatingPlanTab = () => {
  const dispatch = useDispatch();

  const {
    eventId,
    seats,
  } = useSelector((state) => state.event);
  const [value, setValue] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [bulkRating, setBulkRating] = useState(3);
  const [reservationName, setReservationName] = useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const updateSeatInfo = (index, newSeatInfo, updatedGuestData) => {
    const updatedSeatingData = seats.map((seat, seatIndex) => {
      if (seatIndex === index) {
        return { ...seat, seatInfo: newSeatInfo };
      }
      return seat;
    });

    const request = {
      seatingPlan: updatedSeatingData,
      guestData: updatedGuestData,
    };
    updateEventApi(eventId, request);
    dispatch(setSeats(updatedSeatingData));
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const exportCurrentSeatingPlan = () => {
    if (!seats || seats.length === 0) return;
    
    const dataStr = JSON.stringify(seats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `seating-plan-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const applyBulkOperation = (operation, rating = null, reserveName = null) => {
    if (selectedSeats.size === 0) return;
    
    // Implementation would depend on your specific requirements
    // This is a placeholder for bulk operations on existing seating plans
    console.log(`Applying ${operation} to ${selectedSeats.size} seats${rating ? ` with rating ${rating}` : ''}${reserveName ? ` with name ${reserveName}` : ''}`);
    
    // Here you would update the actual seating data based on the operation
    // For now, this is a basic implementation
    const updatedSeats = seats.map((seatHouse, houseIndex) => {
      const updatedHouse = { ...seatHouse };
      
      if (updatedHouse.seatInfo) {
        updatedHouse.seatInfo = updatedHouse.seatInfo.map((row, rowIndex) => {
          const updatedRow = { ...row };
          updatedRow.column = row.column.map((seat, colIndex) => {
            const seatKey = `${houseIndex}-${rowIndex}-${colIndex}`;
            
            if (selectedSeats.has(seatKey)) {
              const updatedSeat = { ...seat };
              
              switch (operation) {
                case 'disable':
                  updatedSeat.disabled = true;
                  updatedSeat.marked = false;
                  updatedSeat.reserved = false;
                  updatedSeat.display = "";
                  break;
                case 'enable':
                  updatedSeat.disabled = false;
                  break;
                case 'reserve':
                  updatedSeat.reserved = true;
                  updatedSeat.marked = false;
                  updatedSeat.disabled = false;
                  updatedSeat.display = reserveName || "";
                  break;
                case 'unreserve':
                  updatedSeat.reserved = false;
                  updatedSeat.display = "";
                  break;
                case 'mark':
                  updatedSeat.marked = true;
                  updatedSeat.reserved = false;
                  updatedSeat.disabled = false;
                  break;
                case 'unmark':
                  updatedSeat.marked = false;
                  break;
                case 'updateRating':
                  if (rating !== null) {
                    updatedSeat.rate = rating;
                  }
                  break;
                default:
                  break;
              }
              
              return updatedSeat;
            }
            return seat;
          });
          
          // Recalculate available seats
          const availableCount = updatedRow.column.filter(
            seat => !seat.disabled && !seat.reserved && !seat.marked
          ).length;
          updatedRow.availableSeat = availableCount;
          
          return updatedRow;
        });
      }
      
      return updatedHouse;
    });
    
    // Update the seats in the store
    dispatch(setSeats(updatedSeats));
    
    // Clear selection and exit bulk mode
    setSelectedSeats(new Set());
    setBulkEditMode(false);
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  return (
    <Grid container spacing={2}>
      {/* Enhanced Controls */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={togglePreviewMode}
              size="small"
            >
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setBulkEditMode(!bulkEditMode)}
              size="small"
              color={bulkEditMode ? 'primary' : 'inherit'}
            >
              Bulk Edit {bulkEditMode ? 'ON' : 'OFF'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={exportCurrentSeatingPlan}
              size="small"
              disabled={!seats || seats.length === 0}
            >
              Export JSON
            </Button>
          </Box>
          
          {seats && seats.length > 0 && (
            <Box display="flex" gap={1}>
              <Chip 
                label={`${seats.length} theater(s)`} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={`${seats.reduce((total, seat) => total + (seat.seatInfo?.length || 0), 0)} rows`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
          )}
        </Box>
      </Grid>

      {/* Bulk Edit Controls */}
      {bulkEditMode && selectedSeats.size > 0 && (
        <Grid item xs={12}>
          <Box p={2} bgcolor="rgba(25, 118, 210, 0.08)" borderRadius={1}>
            <Typography variant="body2" gutterBottom>
              {selectedSeats.size} seat(s) selected
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => applyBulkOperation('disable')}
              >
                Disable Selected
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => applyBulkOperation('enable')}
              >
                Enable Selected
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSelectedSeats(new Set())}
              >
                Clear Selection
              </Button>
            </Box>
            
            {/* Reservation Name Input */}
            <TextField
              fullWidth
              label="Reservation Name"
              value={reservationName}
              onChange={(e) => setReservationName(e.target.value)}
              placeholder="Enter name for reservation"
              size="small"
              sx={{ mb: 2 }}
            />
            
            <Box display="flex" gap={1} mb={2}>
              <Button
                size="small"
                variant="contained"
                color="warning"
                onClick={() => applyBulkOperation('reserve', null, reservationName)}
              >
                Reserve Selected
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => applyBulkOperation('unreserve')}
              >
                Unreserve Selected
              </Button>
            </Box>
            
            {/* Rating Controls */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Update Rating: {bulkRating} ★
              </Typography>
              <Slider
                value={bulkRating}
                onChange={(_, newValue) => setBulkRating(newValue)}
                min={1}
                max={5}
                marks={[
                  { value: 1, label: '1★' },
                  { value: 2, label: '2★' },
                  { value: 3, label: '3★' },
                  { value: 4, label: '4★' },
                  { value: 5, label: '5★' },
                ]}
                step={1}
                valueLabelDisplay="auto"
                sx={{ mb: 1 }}
              />
              <Button
                size="small"
                variant="contained"
                fullWidth
                onClick={() => applyBulkOperation('updateRating', bulkRating)}
              >
                Apply Rating ({bulkRating}★) to Selected
              </Button>
            </Box>
          </Box>
        </Grid>
      )}

      {/* Tabs */}
      <Grid item xs={12}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="seating plan tabs"
          fullWidth
          sx={{
            ".MuiTabs-flexContainer": {
              justifyContent: "space-around", // Adjusts the alignment of the tabs
            },
          }}
        >
          {seats?.map((seat, index) => (
            <Tab 
              key={index} 
              label={
                <Box>
                  <Typography variant="body2">
                    {seat.houseDisplay || `Theater ${index + 1}`}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {seat.seatInfo?.length || 0} rows
                  </Typography>
                </Box>
              } 
            />
          )) || null}
        </Tabs>
      </Grid>

      {/* Seating Plan Content */}
      <Grid item xs={12}>
        {seats?.map((seat, index) => (
          <TabPanel key={index} value={value} index={index}>
            <SeatingPlan
              index={index}
              previewMode={previewMode}
              bulkEditMode={bulkEditMode}
              selectedSeats={selectedSeats}
              onSeatSelect={(seatKey) => {
                if (bulkEditMode) {
                  const newSelected = new Set(selectedSeats);
                  if (newSelected.has(seatKey)) {
                    newSelected.delete(seatKey);
                  } else {
                    newSelected.add(seatKey);
                  }
                  setSelectedSeats(newSelected);
                }
              }}
              onUpdateSeatInfo={(newSeatInfo, updatedGuestData) =>
                updateSeatInfo(index, newSeatInfo, updatedGuestData)
              }
            />
          </TabPanel>
        ))}
      </Grid>
    </Grid>
  );
};

export default SeatingPlanTab;
