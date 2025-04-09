import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Typography } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { setIsPopupVisible } from "../../redux/feature/eventSlice"; // Adjust the import path as necessary

const SeatAssignmentPopup = () => {
  const dispatch = useDispatch();

  const { assignedSeats, isPopupVisible } = useSelector((state) => state.event);

  const onClose = () => {
    dispatch(setIsPopupVisible(false));
  };

  return (
    <Dialog
      open={isPopupVisible}
      onClose={onClose}
      aria-labelledby="seat-assignment-title"
    >
      <DialogTitle id="seat-assignment-title">Seat Assignment</DialogTitle>
      <DialogContent>
        <List>
          {assignedSeats.map((seat, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <>
                    <Typography variant="h4">
                      Assign Seat:{" "}
                      <Typography variant="h4 " sx={{ color: "#76b5c5" }}>
                        {seat.seatNo}
                      </Typography>
                    </Typography>
                    <Typography variant="h4" sx={{ color: "#76b5c5" }}>
                      {seat.house}
                    </Typography>
                    {index === 0 && seat.extra !== "0" && seat.extra !== "" && (
                      <Typography variant="h3" sx={{ color: "red" }}>
                        Extra: {seat.extra}
                      </Typography>
                    )}
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
