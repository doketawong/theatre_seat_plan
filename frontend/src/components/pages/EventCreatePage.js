import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import UploadEvent from '../../component/pages/UploadEvent';

const EventCreatePage = () => {
  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Event Creation
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Create new events and upload participant data from CSV files.
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <UploadEvent />
      </Paper>
    </Container>
  );
};

export default EventCreatePage;
