import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import SeatingPlan from "./component/pages/SeatingPlan"; // Assuming this is your seating plan component

const SeatingPlanTab = ({ plans }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
    <div>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="seating plan tabs"
      >
        {plans.map((plan, index) => (
          <Tab key={plan.planId} label={plan.label} />
        ))}
      </Tabs>
      {plans.map((plan, index) => (
        <TabPanel key={plan.planId} value={value} index={index}>
          <SeatingPlan
            planId={plan.planId}
            seat={seat}
            eventName={eventName}
            eventHouse={eventHouse}
            eventId={eventId}
          />
        </TabPanel>
      ))}
    </div>
  );
};
