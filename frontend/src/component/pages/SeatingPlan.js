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
  TextField,
  Autocomplete,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

const SeatingPlan = ({ index, onUpdateSeatInfo }) => {
  const dispatch = useDispatch();

  const { seats, guestData, eventName, eventHouse } = useSelector(
    (state) => state.event
  );

  const seat = seats[index].seatInfo;
  const [open, setOpen] = useState(false);
  const [selectedCol, setSelectedCol] = useState({});
  const [selectedRow, setSelectedRow] = useState({});
  const [selectedSeat, setSelectedSeat] = useState({});
  const [selectedGuest, setSelectedGuest] = useState([]);
  const [selectedReserved, setSelectedReserved] = useState("");

  useEffect(() => {}, [seats]);

  const handleClick = (event) => {
    setSelectedCol({
      ...selectedCol,
      [event.target.name]: event.target.checked,
    });
  };

  const handleRatingChange = (event) => {
    setSelectedCol({
      ...selectedCol,
      rate: event.target.value,
    });
  };

  const handleClickOpen = (col, row) => {
    const seat = row.row + col.column;
    setSelectedCol(col);
    setSelectedRow(row);
    setSelectedSeat(seat);
    setSelectedGuest(guestData.find((g) => g.ig === col.display));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTextChange = (event) => {
    setSelectedReserved(event.target.value);
  };

  const getBackgroundColor = (col) => {
    if (col.marked) {
      return "#00FF00";
    } else if (col.reserved) {
      return "#CBCBCB";
    } else if (col.disabled) {
      return "#FF0000";
    } else {
      return "#CBCBCB";
    }
  };

  const updateSeatingPlan = () => {
    const updatedSeats = seat.map((temp) => {
      // Create a shallow copy of the temp object
      const updatedTemp = { ...temp };
  
      // Update the column property
      updatedTemp.column = temp.column.map((col) => {
        if (
          col.id === selectedCol.id &&
          col.column === selectedCol.column &&
          temp.row === selectedRow.row
        ) {
          let guestNum = selectedGuest ? parseInt(selectedGuest.guest_num, 10) : 0;
  
          if (selectedCol.marked && guestNum > 0) {
            col = { ...col, display: selectedGuest.ig, marked: true };
            selectedGuest.guest_num = (guestNum - 1).toString();
            updatedTemp.availableSeat--;
            if (selectedGuest.guest_num === "0") {
              selectedGuest.checked = true;
            }
  
            const guestIndex = guestData.findIndex(
              (temp) => temp.id === selectedGuest.id
            );
            if (guestIndex !== -1) {
              guestData[guestIndex] = {
                ...guestData[guestIndex],
                ...selectedGuest,
              };
            }
          } else if (selectedCol.reserved) {
            col = { ...col, display: selectedReserved, reserved: true };
          } else if (selectedCol.disabled) {
            col = { ...col, display: "", disabled: true };
          } else {
            if (selectedCol.marked) {
              selectedGuest.guest_num = (guestNum + 1).toString();
              selectedGuest.checked = false;
              updatedTemp.availableSeat++;
            }
            col = {
              ...col,
              display: "",
              marked: false,
              disabled: false,
              reserved: false,
            };
          }
          col.rate = selectedCol.rate;
        }
  
        return col;
      });
  
      return updatedTemp; // Return the updated object
    });
  
    onUpdateSeatInfo(updatedSeats, guestData);
    setOpen(false);
  };

  const handleSelectGuest = (event, newValue) => {
    // Complex logic to determine the selected guest
    setSelectedGuest(newValue);
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
                        Row: {row.row} {row.availableSeat}
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
                            backgroundColor: getBackgroundColor(col),
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
          {selectedCol.marked ? (
            <DialogContent>
              <FormControlLabel
                control={
                  <Autocomplete
                    fullWidth
                    value={selectedGuest}
                    options={guestData}
                    getOptionLabel={(option) => option.ig}
                    onChange={handleSelectGuest}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="IG"
                        InputProps={{
                          ...params.InputProps,
                          style: {
                            backgroundColor: "white", // Keep the background color as white
                            width: "500px",
                          },
                        }}
                        style={{
                          width: "500px", // Adjust this value to set the desired width
                        }}
                      />
                    )}
                  />
                }
                label="IG"
                labelPlacement="start"
              />
            </DialogContent>
          ) : (
            ""
          )}
          {selectedCol.reserved ? (
            <DialogContent>
              <FormControlLabel
                control={
                  <TextField
                    variant="outlined"
                    size="small"
                    value={selectedReserved}
                    onChange={handleTextChange}
                  />
                }
                label="Name"
                labelPlacement="start"
              />
            </DialogContent>
          ) : (
            ""
          )}
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
            <TextField
              label="Rating"
              type="number"
              value={selectedCol.rate || ""}
              onChange={(e) => handleRatingChange(e)}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
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
