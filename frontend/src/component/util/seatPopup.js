import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const SeatAssignmentPopup = ({ seats, onClose, open }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="seat-assignment-title"
    >
      <DialogTitle id="seat-assignment-title">Seat Assignment</DialogTitle>
      <DialogContent>
        <List>
          {seats.map((seat, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <>
                    <div>Assign Seat: {seat.seatNo}</div>
                    <div>{seat.house}</div>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatAssignmentPopup;
