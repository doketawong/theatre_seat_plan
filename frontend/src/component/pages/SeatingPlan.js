import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  Autocomplete,
} from "@mui/material";
import React, { useState, forwardRef, useEffect } from "react";
import { uploadEventApi, getHouseByIdApi, getAllHouseApi } from "../util/api";

const SeatingPlan = (props) => {
  const [form, setForm] = useState({
    eventName: "",
    eventDate: "",
    eventHouse: "",
    houseIds: [],
    file: null,
  });
  const [open, setOpen] = useState(false);
  const [selectedCol, setSelectedCol] = useState({});
  const [selectedSeat, setSelectedSeat] = useState({});
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    getAllHouseApi().then((data) => {
      setHouses(data.results);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleClick = (event) => {
    setSelectedCol({
      ...selectedCol,
      [event.target.name]: event.target.checked,
    });
  };

  const handleFileChange = (e) => {
    setForm((prevState) => ({ ...prevState, file: e.target.files[0] }));
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));

    getHouseByIdApi(form.houseIds).then((data) => {
      const seatsArray = data.results.reduce((acc, val) => acc.concat(val.seat), []);
      const seatsJoined = seatsArray.join(",");
      formData.append("seat", seatsJoined);
      uploadEventApi(formData);
    });
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
            {props.eventName}({props.eventHouse})
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

        {props.seat ? (
          props.seat
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
          <DialogContent>IG: { selectedCol.display }</DialogContent>
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography mb={2} style={{ color: "white" }}>
            Submit Event with guest data:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  name="eventName"
                  label="Movie Name"
                  value={form.eventName}
                  onChange={handleChange}
                  InputProps={{
                    style: {
                      backgroundColor: "white", // Background color changed to white
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  name="eventDate"
                  label="Event Date"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={form.eventDate}
                  onChange={handleChange}
                  InputProps={{
                    style: {
                      backgroundColor: "white", // Background color changed to white
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                {houses && houses.length > 0 ? (
                  <Autocomplete
                    multiple
                    fullWidth
                    options={houses}
                    getOptionLabel={(option) => option.display_name}
                    value={
                      // Find multiple houses based on an array of houseIds
                      houses.filter((house) =>
                        form.houseIds.includes(house.house_id)
                      ) || []
                    }
                    onChange={(event, newValue) => {
                      setForm({
                        ...form,
                        houseIds: newValue.map((item) => item.house_id),
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="House id"
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
                  <p>No houses available</p>
                )}
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography style={{ color: "white" }}>
                  Upload participant
                </Typography>
                <input type="file" onChange={handleFileChange} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default forwardRef(SeatingPlan);
