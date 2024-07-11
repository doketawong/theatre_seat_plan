import { Box, Button, Typography, TextField, Grid } from "@mui/material";
import React, { useState, forwardRef } from "react";
import { formSubmit, fetchData } from "../util/utils";

const SeatingPlan = (props) => {
  const [form, setForm] = useState({
    eventName: "",
    eventDate: "",
    houseId: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prevState) => ({ ...prevState, file: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));

    const response = fetchData(`/getHouse/${form.houseId}`, {
      method: "GET",
      body: formData,
    }).then((data) => {
      formData.append("seat", data.results[0].seat);
      formSubmit(`/uploadEvent`, {
        method: "POST",
        body: formData,
      });
    });
  };

  return (
    <Box>
      <div>
        <Typography>
          <b>{props.eventName}</b>
        </Typography>

        {props.seat ? (
          props.seat.map((row, rowIndex) => (
            <Box key={rowIndex} mb={2}>
              <Grid container xs={12} alignItems="center">
                <Grid item xs={12} sm={1}>
                  <Typography variant="h6">Row: {row.row}</Typography>
                </Grid>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                >
                  {row.column.map((col) => (
                    <Grid item key={col.id}>
                      <Box
                        p={1}
                        border={1}
                        borderColor="grey.500"
                        style={{
                          opacity: col.disabled ? 0.5 : 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          backgroundColor: col.marked ? "red" : col.reserved ? "blue" : "transparent"
                        }}
                      >
                        <div>
                          <Typography variant="body1">{col.column}</Typography>
                        </div>
                        <div>
                          <Typography variant="body1">{col.display}</Typography>
                        </div>
                      </Box>
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
      </div>
      <hr />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography mb={2}>Submit Event with guest data:</Typography>
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
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  name="houseId"
                  label="House id"
                  value={form.houseId}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography>Upload participant</Typography>
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
