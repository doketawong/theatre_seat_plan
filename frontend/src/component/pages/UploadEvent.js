import {
  Button,
  Typography,
  TextField,
  Grid,
  Autocomplete,
} from "@mui/material";
import { useState, useEffect } from "react";
import { uploadEventApi, getHouseByIdApi, getAllHouseApi } from "../util/api";

function UploadPage() {
  const [form, setForm] = useState({
    eventName: "",
    eventDate: "",
    eventHouse: "",
    houseIds: [],
    file: null,
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));

    getHouseByIdApi(form.houseIds).then((data) => {
      const seatsArray = data.results.map((val) =>
        JSON.parse(val.seat.replace(/\n/g, "").trim())
      );
      formData.append("seat", JSON.stringify(seatsArray));
      uploadEventApi(formData);
    });
  };

  const handleFileChange = (e) => {
    setForm((prevState) => ({ ...prevState, file: e.target.files[0] }));
  };

  return (
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
  );
}

export default UploadPage;