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
        <Typography variant="h3" style={{ color: "white" }}>
          <b>{props.eventName}</b>
        </Typography>

        {props.seat ? (
          props.seat.map((row, rowIndex) => (
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
                      <Box
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
