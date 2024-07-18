import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";

const SeatingPlan = ({seat, eventName, eventHouse}) => {

  const [open, setOpen] = useState(false);
  const [selectedCol, setSelectedCol] = useState({});
  const [selectedSeat, setSelectedSeat] = useState({});

  const handleClick = (event) => {
    setSelectedCol({
      ...selectedCol,
      [event.target.name]: event.target.checked,
    });
  };

  const handleClickOpen = (col, row) => {
    const seat = row.row + col.column;
    setSelectedCol(col);
    setSelectedSeat(seat);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const updateSeatingPlan = () => {
    // Implement the logic to update the seating plan here
    console.log("Seating plan updated:", selectedCol);
    // You might want to send this data to a backend server or update it locally
  };

  return (
    <Box>
      <div>
        <Typography variant="h3" style={{ color: "white" }} mb={2}>
          <b>
            {eventName}({eventHouse})
          </b>
        </Typography>

        <Box mb={4} display="flex" justifyContent="center">
          <Paper
            elevation={3}
            style={{
              padding: "8px 32px",
              backgroundColor: "#424242",
              color: "white",
              width: "50%",
            }}
          >
            <Typography variant="h5">Screen</Typography>
          </Paper>
        </Box>

        {seat ? (
          seat
            .slice()
            .reverse()
            .map((row, rowIndex) => (
              <Box key={rowIndex} mb={2}>
                <Grid container xs={12} alignItems="center">
                  <Grid container alignItems="center" justifyContent="center">
                    <Grid item xs={12} sm={1}>
                      <Typography variant="h6" style={{ color: "white" }}>
                        Row: {row.row}
                      </Typography>
                    </Grid>
                    {row.column.map((col) => (
                      <Grid item key={col.id}>
                        <Button
                          onClick={() => handleClickOpen(col, row)}
                          p={1}
                          border={1}
                          borderRadius="8px"
                          borderColor="grey.500"
                          style={{
                            width: "50px",
                            height: "50px",
                            opacity: col.disabled ? 0 : 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            backgroundColor: col.marked
                              ? "#00FF00"
                              : col.reserved
                              ? "#D899FF"
                              : "#CBCBCB",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography
                              variant="body1"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {row.row}
                              {col.column}
                            </Typography>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography
                              variant="caption"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {col.display}
                            </Typography>
                          </div>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Box>
            ))
        ) : (
          <tr>
            <td>Loading...</td>
          </tr>
        )}
        <Dialog open={open} onClose={handleClose} sx={{ minWidth: 250 }}>
          <DialogTitle>Seat {selectedSeat} Details</DialogTitle>
          <DialogContent>IG: {selectedCol.display}</DialogContent>
          <DialogContent>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCol.marked}
                  onChange={handleClick}
                  name="marked"
                  color="primary"
                />
              }
              label="Marked"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCol.disabled}
                  onChange={handleClick}
                  name="disabled"
                  color="primary"
                />
              }
              label="Disabled"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCol.reserved}
                  onChange={handleClick}
                  name="reserved"
                  color="primary"
                />
              }
              label="Reserved"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={updateSeatingPlan}
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <hr />
    </Box>
  );
};

export default SeatingPlan;
