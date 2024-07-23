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
      const seatsArray = data.results.map((val) => {
        const seatInfo = JSON.parse(val.seat.replace(/\n/g, "").trim());
        
        const houseDisplay  = val.display_name;
        return {seatInfo, houseDisplay};
      });

      seatsArray.forEach((item) => {
        const { seatInfo, houseDisplay } = item;
seatInfo.forEach((row, rowIndex) => {
  // Assuming an updated condition to check for available seats that are not marked, disabled, or reserved
  // This is a placeholder condition; the actual implementation may vary based on how such seats are represented
  const availableSeats = row.column.filter(seat =>  !seat.marked && !seat.disabled && !seat.reserved).length;
  console.log(`House: ${houseDisplay}, Row: ${rowIndex + 1}, Available Seats: ${availableSeats}`);
});
      });

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
