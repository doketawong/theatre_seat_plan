import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';

const Generate2DArrayPage = () => {
  const [rows, setRows] = useState(10);
  const [columns, setColumns] = useState(15);
  const [generatedArray, setGeneratedArray] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const generateArray = () => {
    const array = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        row.push({
          row: i + 1,
          column: j + 1,
          seatNumber: `${String.fromCharCode(65 + i)}${j + 1}`,
          available: true,
          reserved: false,
          disabled: false,
        });
      }
      array.push(row);
    }
    setGeneratedArray(array);
  };

  const exportToJSON = () => {
    if (!generatedArray) return;
    
    const dataStr = JSON.stringify(generatedArray, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `seating-array-${rows}x${columns}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowSuccess(true);
  };

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generate 2D Seating Array
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Generate custom seating layouts with configurable rows and columns.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Array Configuration
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Number of Rows"
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: 50 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Number of Columns"
                  type="number"
                  value={columns}
                  onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: 50 }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={generateArray}
                fullWidth
              >
                Generate Array
              </Button>
              
              {generatedArray && (
                <Button
                  variant="outlined"
                  onClick={exportToJSON}
                  fullWidth
                >
                  Export JSON
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            
            {generatedArray ? (
              <Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Array dimensions: {rows} rows × {columns} columns = {rows * columns} seats
                </Typography>
                
                <Box 
                  sx={{ 
                    maxHeight: 400, 
                    overflow: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 1,
                    bgcolor: '#fafafa'
                  }}
                >
                  {generatedArray.map((row, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      {row.map((seat, colIndex) => (
                        <Box
                          key={colIndex}
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: seat.available ? '#4caf50' : '#f44336',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px',
                            color: 'white',
                            borderRadius: 0.5,
                          }}
                          title={seat.seatNumber}
                        >
                          {seat.seatNumber}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Click "Generate Array" to preview the seating layout.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Array exported successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Generate2DArrayPage;
