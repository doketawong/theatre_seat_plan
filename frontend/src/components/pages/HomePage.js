import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Box
} from '@mui/material';
import { 
  EventSeat, 
  Event, 
  Assignment, 
  Dashboard 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Seating Plan Management',
      description: 'View and manage theatre seating arrangements with interactive seat selection.',
      icon: <EventSeat sx={{ fontSize: 40 }} />,
      path: '/seating-plan',
      color: '#1976d2'
    },
    {
      title: 'Event Creation',
      description: 'Create new events and upload participant data from CSV files.',
      icon: <Event sx={{ fontSize: 40 }} />,
      path: '/event-create',
      color: '#2e7d32'
    },
    {
      title: 'Seat Assignment',
      description: 'Assign specific seats to guests and manage reservations.',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      path: '/seat-assign',
      color: '#ed6c02'
    },
    {
      title: 'Generate 2D Array',
      description: 'Generate custom seating layouts with configurable rows and columns.',
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      path: '/generate-2d-array',
      color: '#9c27b0'
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Theatre Seat Management
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Manage your theatre events, seating plans, and guest assignments
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Box 
                  sx={{ 
                    color: feature.color, 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => handleNavigate(feature.path)}
                  sx={{ 
                    backgroundColor: feature.color,
                    '&:hover': {
                      backgroundColor: feature.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
                >
                  Get Started
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={8} textAlign="center">
        <Typography variant="h6" gutterBottom>
          Quick Stats
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h4" color="primary">
                500+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Seats Managed
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h4" color="primary">
                50+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Events Created
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h4" color="primary">
                1000+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Guest Assignments
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
