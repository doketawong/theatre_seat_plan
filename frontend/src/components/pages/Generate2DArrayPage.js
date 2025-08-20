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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Slider,
  Chip,
  Tooltip,
} from '@mui/material';

const Generate2DArrayPage = () => {
  const [rows, setRows] = useState(10);
  const [columns, setColumns] = useState(15);
  const [generatedArray, setGeneratedArray] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('grid'); // 'grid' or 'theatre'
  
  // For bulk operations
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [bulkRating, setBulkRating] = useState(3);
  const [reservationName, setReservationName] = useState('');

  const generateArray = () => {
    const array = [];
    for (let i = 0; i < rows; i++) {
      const rowData = {
        row: String.fromCharCode(65 + i), // A, B, C, etc.
        availableSeat: columns,
        column: []
      };
      
      for (let j = 0; j < columns; j++) {
        rowData.column.push({
          id: i * columns + j + 1,
          column: j + 1,
          display: "",
          marked: false,
          reserved: false,
          disabled: false,
          rate: 3 // Default rating
        });
      }
      array.push(rowData);
    }
    setGeneratedArray(array);
    setSelectedSeats(new Set());
  };

  const handleSeatClick = (rowIndex, colIndex, seat) => {
    if (multiSelectMode) {
      const seatKey = `${rowIndex}-${colIndex}`;
      const newSelectedSeats = new Set(selectedSeats);
      if (newSelectedSeats.has(seatKey)) {
        newSelectedSeats.delete(seatKey);
      } else {
        newSelectedSeats.add(seatKey);
      }
      setSelectedSeats(newSelectedSeats);
    } else {
      setSelectedSeat({ rowIndex, colIndex, seat });
      setEditDialogOpen(true);
    }
  };

  const updateSeat = (rowIndex, colIndex, updatedSeat) => {
    const newArray = [...generatedArray];
    newArray[rowIndex].column[colIndex] = { ...updatedSeat };
    
    // Recalculate available seats for the row
    const availableCount = newArray[rowIndex].column.filter(
      seat => !seat.disabled && !seat.reserved && !seat.marked
    ).length;
    newArray[rowIndex].availableSeat = availableCount;
    
    setGeneratedArray(newArray);
  };

  const applyBulkOperation = (operation, rating = null, reserveName = null) => {
    if (selectedSeats.size === 0) return;
    
    const newArray = [...generatedArray];
    selectedSeats.forEach(seatKey => {
      const [rowIndex, colIndex] = seatKey.split('-').map(Number);
      const seat = newArray[rowIndex].column[colIndex];
      
      switch (operation) {
        case 'disable':
          seat.disabled = true;
          seat.marked = false;
          seat.reserved = false;
          seat.display = "";
          break;
        case 'enable':
          seat.disabled = false;
          break;
        case 'reserve':
          seat.reserved = true;
          seat.marked = false;
          seat.disabled = false;
          seat.display = reserveName || "";
          break;
        case 'unreserve':
          seat.reserved = false;
          seat.display = "";
          break;
        case 'mark':
          seat.marked = true;
          seat.reserved = false;
          seat.disabled = false;
          break;
        case 'unmark':
          seat.marked = false;
          break;
        case 'updateRating':
          if (rating !== null) {
            seat.rate = rating;
          }
          break;
        default:
          break;
      }
    });
    
    // Recalculate available seats for affected rows
    const affectedRows = new Set();
    selectedSeats.forEach(seatKey => {
      const [rowIndex] = seatKey.split('-').map(Number);
      affectedRows.add(rowIndex);
    });
    
    affectedRows.forEach(rowIndex => {
      const availableCount = newArray[rowIndex].column.filter(
        seat => !seat.disabled && !seat.reserved && !seat.marked
      ).length;
      newArray[rowIndex].availableSeat = availableCount;
    });
    
    setGeneratedArray(newArray);
    setSelectedSeats(new Set());
    setMultiSelectMode(false);
  };

  const getSeatColor = (seat) => {
    if (seat.disabled) return '#f44336'; // Red
    if (seat.reserved) return '#ff9800'; // Orange
    if (seat.marked) return '#4caf50'; // Green
    return '#2196f3'; // Blue (available)
  };

  const getSeatTooltip = (seat, rowName) => {
    const seatNumber = `${rowName}${seat.column}`;
    let status = 'Available';
    if (seat.disabled) status = 'Disabled';
    else if (seat.reserved) status = 'Reserved';
    else if (seat.marked) status = 'Marked';
    
    return `${seatNumber} - ${status} (Rate: ${seat.rate})`;
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
    <Container maxWidth="xl">
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generate Enhanced Seating Plan
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Generate and customize seating layouts with interactive preview and bulk editing features.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Layout Configuration
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
            
            <Button
              variant="contained"
              onClick={generateArray}
              fullWidth
              sx={{ mb: 2 }}
            >
              Generate Layout
            </Button>

            {generatedArray && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setPreviewMode(previewMode === 'grid' ? 'theatre' : 'grid')}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Switch to {previewMode === 'grid' ? 'Theatre' : 'Grid'} View
                </Button>

                <Button
                  variant="outlined"
                  onClick={exportToJSON}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Export JSON
                </Button>
              </>
            )}
          </Paper>

          {/* Bulk Operations Panel */}
          {generatedArray && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bulk Operations
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={multiSelectMode}
                    onChange={(e) => {
                      setMultiSelectMode(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedSeats(new Set());
                      }
                    }}
                  />
                }
                label="Multi-select mode"
              />

              {selectedSeats.size > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {selectedSeats.size} seat(s) selected
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => applyBulkOperation('disable')}
                      >
                        Disable
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        fullWidth
                        onClick={() => applyBulkOperation('enable')}
                      >
                        Enable
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Reservation Name"
                        value={reservationName}
                        onChange={(e) => setReservationName(e.target.value)}
                        placeholder="Enter name for reservation"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        fullWidth
                        onClick={() => applyBulkOperation('reserve', null, reservationName)}
                      >
                        Reserve
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => applyBulkOperation('unreserve')}
                      >
                        Unreserve
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Rating Controls */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Update Rating: {bulkRating} ★
                    </Typography>
                    <Slider
                      value={bulkRating}
                      onChange={(_, newValue) => setBulkRating(newValue)}
                      min={1}
                      max={5}
                      marks={[
                        { value: 1, label: '1★' },
                        { value: 2, label: '2★' },
                        { value: 3, label: '3★' },
                        { value: 4, label: '4★' },
                        { value: 5, label: '5★' },
                      ]}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ mb: 1 }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      onClick={() => applyBulkOperation('updateRating', bulkRating)}
                      sx={{ mb: 1 }}
                    >
                      Apply Rating ({bulkRating}★) to Selected
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
        
        {/* Preview Panel */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Interactive Preview
              </Typography>
              
              {generatedArray && (
                <Box display="flex" gap={1}>
                  <Chip label={`${rows} × ${columns}`} size="small" />
                  <Chip label={`${rows * columns} total seats`} size="small" />
                </Box>
              )}
            </Box>
            
            {generatedArray ? (
              <Box>
                {/* Legend */}
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#2196f3', borderRadius: 0.5 }} />
                    <Typography variant="caption">Available</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: 0.5 }} />
                    <Typography variant="caption">Disabled</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: 0.5 }} />
                    <Typography variant="caption">Reserved</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: 0.5 }} />
                    <Typography variant="caption">Marked</Typography>
                  </Box>
                </Box>

                <Box 
                  sx={{ 
                    maxHeight: 500, 
                    overflow: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    bgcolor: previewMode === 'theatre' ? '#000' : '#fafafa'
                  }}
                >
                  {generatedArray.slice().reverse().map((row, reverseIndex) => {
                    const rowIndex = generatedArray.length - 1 - reverseIndex;
                    
                    return (
                      <Box key={rowIndex}>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 0.5, 
                          mb: 1,
                          alignItems: 'center',
                          justifyContent: previewMode === 'theatre' ? 'center' : 'flex-start'
                        }}>
                        {previewMode === 'theatre' && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              minWidth: 30, 
                              textAlign: 'right', 
                              mr: 1,
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            {row.row}
                          </Typography>
                        )}
                        
                        {row.column.map((seat, colIndex) => {
                          const seatKey = `${rowIndex}-${colIndex}`;
                          const isSelected = selectedSeats.has(seatKey);
                          
                          return (
                            <Tooltip key={colIndex} title={getSeatTooltip(seat, row.row)}>
                              <Box
                                onClick={() => handleSeatClick(rowIndex, colIndex, seat)}
                                sx={{
                                  width: previewMode === 'theatre' ? 40 : 24,
                                  height: previewMode === 'theatre' ? 40 : 24,
                                  bgcolor: isSelected ? '#9c27b0' : getSeatColor(seat),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: previewMode === 'theatre' ? '10px' : '8px',
                                  color: 'white',
                                  borderRadius: 0.5,
                                  cursor: 'pointer',
                                  border: isSelected ? '2px solid #9c27b0' : 'none',
                                  opacity: seat.disabled ? 0.3 : 1,
                                  '&:hover': {
                                    opacity: 0.8,
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                {previewMode === 'theatre' ? (
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ fontSize: '8px', lineHeight: 1 }}>
                                      {row.row}{seat.column}
                                    </Typography>
                                    {seat.rate && (
                                      <Typography variant="caption" sx={{ fontSize: '6px', lineHeight: 1 }}>
                                        ★{seat.rate}
                                      </Typography>
                                    )}
                                  </Box>
                                ) : (
                                  `${row.row}${seat.column}`
                                )}
                              </Box>
                            </Tooltip>
                          );
                        })}
                        
                        {previewMode === 'theatre' && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              ml: 2, 
                              color: 'white',
                              minWidth: 60
                            }}
                          >
                            {row.availableSeat} avail
                          </Typography>
                        )}
                        </Box>
                        
                        {/* Screen positioning - show after row A */}
                        {previewMode === 'theatre' && row.row === 'A' && (
                          <Box mt={2} display="flex" justifyContent="center">
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1,
                                bgcolor: '#424242',
                                color: 'white',
                                borderRadius: 1
                              }}
                            >
                              <Typography variant="h6">SCREEN</Typography>
                            </Paper>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" py={8}>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Click "Generate Layout" to create and preview your seating arrangement
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  You'll be able to edit individual seats and apply bulk operations
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Seat Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Seat {selectedSeat && generatedArray && 
            `${generatedArray[selectedSeat.rowIndex]?.row}${selectedSeat.seat?.column}`}
        </DialogTitle>
        <DialogContent>
          {selectedSeat && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedSeat.seat.disabled}
                        onChange={(e) => {
                          const newSeat = { ...selectedSeat.seat, disabled: e.target.checked };
                          if (e.target.checked) {
                            newSeat.marked = false;
                            newSeat.reserved = false;
                          }
                          setSelectedSeat({ ...selectedSeat, seat: newSeat });
                        }}
                      />
                    }
                    label="Disabled"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedSeat.seat.reserved}
                        onChange={(e) => {
                          const newSeat = { ...selectedSeat.seat, reserved: e.target.checked };
                          if (e.target.checked) {
                            newSeat.marked = false;
                            newSeat.disabled = false;
                          }
                          setSelectedSeat({ ...selectedSeat, seat: newSeat });
                        }}
                        disabled={selectedSeat.seat.disabled}
                      />
                    }
                    label="Reserved"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedSeat.seat.marked}
                        onChange={(e) => {
                          const newSeat = { ...selectedSeat.seat, marked: e.target.checked };
                          if (e.target.checked) {
                            newSeat.reserved = false;
                            newSeat.disabled = false;
                          }
                          setSelectedSeat({ ...selectedSeat, seat: newSeat });
                        }}
                        disabled={selectedSeat.seat.disabled}
                      />
                    }
                    label="Marked"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Rating: {selectedSeat.seat.rate}</Typography>
                  <Slider
                    value={selectedSeat.seat.rate}
                    onChange={(_, newValue) => {
                      setSelectedSeat({ 
                        ...selectedSeat, 
                        seat: { ...selectedSeat.seat, rate: newValue } 
                      });
                    }}
                    min={1}
                    max={5}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Display Text"
                    value={selectedSeat.seat.display}
                    onChange={(e) => {
                      setSelectedSeat({ 
                        ...selectedSeat, 
                        seat: { ...selectedSeat.seat, display: e.target.value } 
                      });
                    }}
                    placeholder="Guest name or identifier"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              if (selectedSeat) {
                updateSeat(selectedSeat.rowIndex, selectedSeat.colIndex, selectedSeat.seat);
              }
              setEditDialogOpen(false);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Seating plan exported successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Generate2DArrayPage;
