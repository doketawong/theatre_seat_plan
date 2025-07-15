import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Autocomplete,
  TextField,
  Alert,
} from '@mui/material';
import {
  setEventId,
  setSeats,
  setEventList,
  setEventName,
  setEventHouse,
} from '../../redux/feature/eventSlice';
import {
  getSeatByEventIdApi,
  getAllEventApi,
} from '../../component/util/api';
import SeatingPlanTab from '../../component/pages/SeatingPlanTab';

const SeatingPlanPage = () => {
  const dispatch = useDispatch();
  const { eventId, eventList, seats, eventName, eventHouse } = useSelector((state) => state.event);

  // Load available events on component mount
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

  // Load seat data when event is selected
  const handleEventChange = (event, selectedEvent) => {
    if (selectedEvent) {
      dispatch(setEventId(selectedEvent.event_id));
      dispatch(setEventName(selectedEvent.event_name));
      dispatch(setEventHouse(selectedEvent.display_name));
      
      // Load seat data for the selected event
      getSeatByEventIdApi(selectedEvent.event_id).then((response) => {
        if (response && response.seating_plan) {
          const seatingPlan = JSON.parse(response.seating_plan);
          dispatch(setSeats(seatingPlan));
        } else {
          console.warn('No seating plan data available for this event');
          dispatch(setSeats([]));
        }
      }).catch((error) => {
        console.error('Error fetching seating plan:', error);
        dispatch(setSeats([]));
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Seating Plan Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage theatre seating arrangements with interactive seat selection.
        </Typography>
      </Box>

      {/* Event Selection */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Event
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {eventList && eventList.length > 0 ? (
              <Autocomplete
                fullWidth
                options={eventList}
                getOptionLabel={(option) => `${option.event_name} - ${option.display_name}`}
                value={eventList.find((item) => item.event_id === eventId) || null}
                onChange={handleEventChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Event"
                    variant="outlined"
                  />
                )}
              />
            ) : (
              <Alert severity="info">No events available. Please create an event first.</Alert>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            {eventName && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Selected Event:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {eventName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {eventHouse}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Seating Plan Display */}
      {seats && seats.length > 0 ? (
        <Paper elevation={3} sx={{ p: 2 }}>
          <SeatingPlanTab />
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center">
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Seating Plan Available
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {eventId ? 
                'The selected event does not have a seating plan configured.' :
                'Please select an event to view its seating plan.'
              }
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default SeatingPlanPage;
