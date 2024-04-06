import { Box, Button, Typography } from '@mui/material';
import React from 'react';

const SeatingPlan = () => {
  // Define the seating plan
  const seatingPlan = [
    [{seat:'A1', marked: true, reserved: true}, 'A2', 'A3', 'A4', 'A5'],
    ['6', '7', '8', '9', '10'],
    ['11', '12', '13', '14', '15'],
    ['16', '17', '18', '19', '20'],
  ];

  return (
    <Box>
      <Typography>Seating Plan</Typography>
      {seatingPlan.map((row, i) => (
        <div key={i}>
          {row.map((seat, j) => (
            <Button key={j} style={{margin: '5px'}}>
              {seat}
            </Button>
          ))}
        </div>
      ))}
    </Box>
  );
};

export default SeatingPlan;