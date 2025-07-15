import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Typography, Box, Chip, Paper, Divider, Alert } from "@mui/material";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSelector, useDispatch } from "react-redux";
import { setIsPopupVisible } from "../../redux/feature/eventSlice";

const SeatAssignmentPopup = () => {
  const dispatch = useDispatch();

  const { assignedSeats, isPopupVisible, selectedValues } = useSelector((state) => state.event);

  const onClose = () => {
    dispatch(setIsPopupVisible(false));
  };

  const totalSeatsAssigned = assignedSeats.length;
  const totalGuests = selectedValues.reduce((acc, guest) => acc + parseInt(guest.guest_num, 10), 0);

  return (
    <Dialog
      open={isPopupVisible}
      onClose={onClose}
      aria-labelledby="seat-assignment-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle 
        id="seat-assignment-title"
        sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" component="div">
          🎬 Seat Assignment Complete!
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: 3 }}>
        {assignedSeats.length > 0 ? (
          <>
            {/* Success Alert */}
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon fontSize="inherit" />}
              sx={{ mb: 3 }}
            >
              Seats have been successfully assigned to your guests!
            </Alert>

            {/* Summary Section */}
            <Box sx={{ mb: 3 }}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Assignment Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${totalSeatsAssigned} Seats Assigned`} 
                    color="success" 
                    variant="filled"
                  />
                  <Chip 
                    label={`${selectedValues.length} Guest Groups`} 
                    color="info" 
                    variant="filled"
                  />
                  <Chip 
                    label={`${totalGuests} Total Guests`} 
                    color="primary" 
                    variant="filled"
                  />
                </Box>
              </Paper>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Assigned Seats List */}
            <Typography variant="h6" gutterBottom color="primary">
              Assigned Seats
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {assignedSeats.map((seat, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <EventSeatIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" component="span">
                          Seat: 
                        </Typography>
                        <Chip 
                          label={seat.seatNo} 
                          color="primary" 
                          size="small" 
                          variant="outlined"
                        />
                        <Typography variant="h6" component="span">
                          in 
                        </Typography>
                        <Chip 
                          label={seat.house} 
                          color="secondary" 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {seat.guest && seat.guest.ig && (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Guest:
                            </Typography>
                            <Chip 
                              label={`IG: ${seat.guest.ig}`} 
                              size="small" 
                              variant="filled"
                              sx={{ backgroundColor: '#e3f2fd' }}
                            />
                            {seat.guest.tel && (
                              <Chip 
                                label={`Tel: ${seat.guest.tel}`} 
                                size="small" 
                                variant="filled"
                                sx={{ backgroundColor: '#f3e5f5' }}
                              />
                            )}
                          </Box>
                        )}
                        {index === 0 && seat.extra && seat.extra !== "0" && seat.extra !== "" && (
                          <Typography variant="body2" sx={{ color: "red", fontWeight: 'bold' }}>
                            Extra Information: {seat.extra}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No seats have been assigned yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please select guests and click "Assign Seats" to begin.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: 2, justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          size="large"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatAssignmentPopup;
