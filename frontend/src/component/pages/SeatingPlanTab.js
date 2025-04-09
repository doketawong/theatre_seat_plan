import { useState } from "react";
import { Tabs, Tab, Box, Grid } from "@mui/material";
import SeatingPlan from "./SeatingPlan"; // Assuming this is your seating plan component
import { updateEventApi } from "../util/api";
import { useSelector, useDispatch } from "react-redux";
import {
  setSeats
} from "../../redux/feature/eventSlice"; // Adjust the import path as necessary

const SeatingPlanTab = () => {
  const dispatch = useDispatch();

  const {
    eventId,
    seats,
  } = useSelector((state) => state.event);
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const updateSeatInfo = (index, newSeatInfo, updatedGuestData) => {
    const updatedSeatingData = seats.map((seat, seatIndex) => {
      if (seatIndex === index) {
        return { ...seat, seatInfo: newSeatInfo };
      }
      return seat;
    });

    const request = {
      seatingPlan: updatedSeatingData,
      guestData: updatedGuestData,
    };
    updateEventApi(eventId, request);
    dispatch(setSeats(updatedSeatingData));
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="seating plan tabs"
          fullWidth
          sx={{
            ".MuiTabs-flexContainer": {
              justifyContent: "space-around", // Adjusts the alignment of the tabs
            },
          }}
        >
          {seats?.map((seat, index) => (
            <Tab key={index} label={index} />
          )) || null}
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        {seats?.map((seat, index) => (
          <TabPanel key={index} value={value} index={index}>
            <SeatingPlan
              index={index}
              onUpdateSeatInfo={(newSeatInfo, updatedGuestData) =>
                updateSeatInfo(index, newSeatInfo, updatedGuestData)
              }
            />
          </TabPanel>
        ))}
      </Grid>
    </Grid>
  );
};

export default SeatingPlanTab;
