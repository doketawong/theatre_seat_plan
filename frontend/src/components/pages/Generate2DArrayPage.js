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
  const [importedData, setImportedData] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importDataText, setImportDataText] = useState('');
  
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
          rate: 5 // Default rating to 5 to match your data
        });
      }
      array.push(rowData);
    }
    setGeneratedArray(array);
    setSelectedSeats(new Set());
  };

  const importData = () => {
    try {
      const parsedData = JSON.parse(importDataText);
      
      // Validate the data structure
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        const firstRow = parsedData[0];
        if (firstRow.row && firstRow.column && Array.isArray(firstRow.column)) {
          setGeneratedArray(parsedData);
          setRows(parsedData.length);
          setColumns(parsedData[0].column.length);
          setShowImportDialog(false);
          setImportDataText('');
          setSelectedSeats(new Set());
          setShowSuccess(true);
        } else {
          alert('Invalid data format. Please check the structure.');
        }
      } else {
        alert('Invalid data format. Expected an array of rows.');
      }
    } catch (error) {
      alert('Invalid JSON format. Please check your data.');
    }
  };

  const loadSampleData = () => {
    const sampleData = [
      {
        "row": "K",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "J",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "I",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "H",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "G",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "F",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "E",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "D",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "C",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "B",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      },
      {
        "row": "A",
        "availableSeat": 13,
        "column": [
          {"id": 1, "column": 1, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 2, "column": 2, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 3, "column": 3, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 4, "column": 4, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 5, "column": 5, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 6, "column": 6, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 7, "column": 7, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 8, "column": 8, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 9, "column": 9, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 10, "column": 10, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 11, "column": 11, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 12, "column": 12, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5},
          {"id": 13, "column": 13, "display": "", "marked": false, "reserved": false, "disabled": false, "rate": 5}
        ]
      }
    ];
    
    setGeneratedArray(sampleData);
    setRows(sampleData.length);
    setColumns(sampleData[0].column.length);
    setSelectedSeats(new Set());
    setShowSuccess(true);
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

  const bulkUpdateSeats = (updates) => {
    const newArray = [...generatedArray];
    updates.forEach(({ rowIndex, colIndex, updatedSeat }) => {
      newArray[rowIndex].column[colIndex] = { ...updatedSeat };
    });
    
    // Recalculate available seats for all affected rows
    recalculateAvailableSeats(newArray);
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

            <Button
              variant="outlined"
              onClick={() => setShowImportDialog(true)}
              fullWidth
              sx={{ mb: 2 }}
            >
              Import Seating Data
            </Button>

            <Button
              variant="outlined"
              onClick={loadSampleData}
              fullWidth
              sx={{ mb: 2 }}
              color="secondary"
            >
              Load Sample Data (11×13)
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
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label={`${rows} × ${columns}`} size="small" />
                  <Chip label={`${rows * columns} total seats`} size="small" />
                  <Chip 
                    label={`${generatedArray.reduce((sum, row) => sum + row.availableSeat, 0)} available`} 
                    size="small" 
                    color="success"
                  />
                  <Chip 
                    label={`${generatedArray.reduce((sum, row) => sum + row.column.filter(s => s.reserved).length, 0)} reserved`} 
                    size="small" 
                    color="warning"
                  />
                  <Chip 
                    label={`${generatedArray.reduce((sum, row) => sum + row.column.filter(s => s.disabled).length, 0)} disabled`} 
                    size="small" 
                    color="error"
                  />
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
                    maxHeight: 600, 
                    overflow: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    bgcolor: previewMode === 'theatre' ? '#1a1a1a' : '#fafafa'
                  }}
                >
                  {/* Theatre mode header */}
                  {previewMode === 'theatre' && (
                    <Box mb={3} display="flex" justifyContent="center">
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          bgcolor: 'linear-gradient(45deg, #424242 30%, #616161 90%)',
                          background: 'linear-gradient(45deg, #424242 30%, #616161 90%)',
                          color: 'white',
                          borderRadius: 2,
                          boxShadow: '0 3px 5px 2px rgba(66, 66, 66, .3)',
                          minWidth: '60%',
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="h5" fontWeight="bold">SCREEN</Typography>
                      </Paper>
                    </Box>
                  )}

                  {generatedArray.slice().reverse().map((row, reverseIndex) => {
                    const rowIndex = generatedArray.length - 1 - reverseIndex;
                    
                    return (
                      <Box key={rowIndex}>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: previewMode === 'theatre' ? 1 : 0.5, 
                          mb: 1,
                          alignItems: 'center',
                          justifyContent: previewMode === 'theatre' ? 'center' : 'flex-start'
                        }}>
                        {previewMode === 'theatre' && (
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              minWidth: 40, 
                              textAlign: 'right', 
                              mr: 2,
                              color: '#ffffff',
                              fontWeight: 'bold',
                              fontFamily: 'monospace'
                            }}
                          >
                            {row.row}
                          </Typography>
                        )}
                        
                        {row.column.map((seat, colIndex) => {
                          const seatKey = `${rowIndex}-${colIndex}`;
                          const isSelected = selectedSeats.has(seatKey);
                          
                          return (
                            <Tooltip 
                              key={colIndex} 
                              title={
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {getSeatTooltip(seat, row.row)}
                                  </Typography>
                                  {seat.display && (
                                    <Typography variant="caption">
                                      Display: {seat.display}
                                    </Typography>
                                  )}
                                </Box>
                              }
                              arrow
                            >
                              <Box
                                onClick={() => handleSeatClick(rowIndex, colIndex, seat)}
                                sx={{
                                  width: previewMode === 'theatre' ? 45 : 28,
                                  height: previewMode === 'theatre' ? 45 : 28,
                                  bgcolor: isSelected ? '#9c27b0' : getSeatColor(seat),
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: previewMode === 'theatre' ? '10px' : '8px',
                                  color: 'white',
                                  borderRadius: previewMode === 'theatre' ? 1 : 0.5,
                                  cursor: 'pointer',
                                  border: isSelected ? '2px solid #9c27b0' : 'none',
                                  opacity: seat.disabled ? 0.3 : 1,
                                  position: 'relative',
                                  '&:hover': {
                                    opacity: 0.8,
                                    transform: 'scale(1.05)',
                                    zIndex: 1,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                  },
                                  transition: 'all 0.2s ease',
                                  boxShadow: previewMode === 'theatre' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none'
                                }}
                              >
                                {previewMode === 'theatre' ? (
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ fontSize: '9px', lineHeight: 1, fontWeight: 'bold' }}>
                                      {row.row}{seat.column}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '7px', lineHeight: 1, color: '#ffeb3b' }}>
                                      ★{seat.rate}
                                    </Typography>
                                  </Box>
                                ) : (
                                  `${row.row}${seat.column}`
                                )}
                                
                                {/* Status indicators */}
                                {seat.reserved && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: -2,
                                      right: -2,
                                      width: 8,
                                      height: 8,
                                      bgcolor: '#ff5722',
                                      borderRadius: '50%',
                                      border: '1px solid white'
                                    }}
                                  />
                                )}
                                {seat.marked && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: -2,
                                      left: -2,
                                      width: 8,
                                      height: 8,
                                      bgcolor: '#4caf50',
                                      borderRadius: '50%',
                                      border: '1px solid white'
                                    }}
                                  />
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
                              color: '#bdbdbd',
                              minWidth: 80,
                              fontSize: '11px'
                            }}
                          >
                            {row.availableSeat}/{row.column.length} available
                          </Typography>
                        )}
                        </Box>
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
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Edit Seat {selectedSeat && generatedArray && 
                `${generatedArray[selectedSeat.rowIndex]?.row}${selectedSeat.seat?.column}`}
            </Typography>
            {selectedSeat && (
              <Chip 
                label={`Rate: ${selectedSeat.seat.rate}★`} 
                size="small" 
                color="primary"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSeat && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Seat Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSeat.seat.disabled}
                            onChange={(e) => {
                              const newSeat = { ...selectedSeat.seat, disabled: e.target.checked };
                              if (e.target.checked) {
                                newSeat.marked = false;
                                newSeat.reserved = false;
                                newSeat.display = "";
                              }
                              setSelectedSeat({ ...selectedSeat, seat: newSeat });
                            }}
                          />
                        }
                        label="Disabled"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSeat.seat.reserved}
                            onChange={(e) => {
                              const newSeat = { ...selectedSeat.seat, reserved: e.target.checked };
                              if (e.target.checked) {
                                newSeat.marked = false;
                                newSeat.disabled = false;
                              } else {
                                newSeat.display = "";
                              }
                              setSelectedSeat({ ...selectedSeat, seat: newSeat });
                            }}
                            disabled={selectedSeat.seat.disabled}
                          />
                        }
                        label="Reserved"
                      />
                    </Grid>
                    <Grid item xs={4}>
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
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Seat Rating: {selectedSeat.seat.rate} ★
                  </Typography>
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
                    marks={[
                      { value: 1, label: '1★' },
                      { value: 2, label: '2★' },
                      { value: 3, label: '3★' },
                      { value: 4, label: '4★' },
                      { value: 5, label: '5★' },
                    ]}
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Display Text / Guest Name"
                    value={selectedSeat.seat.display}
                    onChange={(e) => {
                      setSelectedSeat({ 
                        ...selectedSeat, 
                        seat: { ...selectedSeat.seat, display: e.target.value } 
                      });
                    }}
                    placeholder="Enter guest name or identifier"
                    disabled={selectedSeat.seat.disabled}
                    helperText={
                      selectedSeat.seat.reserved 
                        ? "Enter the name of the person this seat is reserved for"
                        : selectedSeat.seat.disabled
                        ? "Disabled seats cannot have display text"
                        : "Optional display text for this seat"
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Seat Preview
                  </Typography>
                  <Box 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: getSeatColor(selectedSeat.seat),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      color: 'white',
                      opacity: selectedSeat.seat.disabled ? 0.3 : 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {generatedArray[selectedSeat.rowIndex]?.row}{selectedSeat.seat?.column}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '8px', color: '#ffeb3b' }}>
                      ★{selectedSeat.seat.rate}
                    </Typography>
                  </Box>
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

      {/* Import Data Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Import Seating Plan Data
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Paste your seating plan JSON data below. The data should be an array of rows with the following structure:
          </Typography>
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" component="pre" sx={{ fontSize: '11px' }}>
{`[
  {
    "row": "A",
    "availableSeat": 13,
    "column": [
      {
        "id": 1,
        "column": 1,
        "display": "",
        "marked": false,
        "reserved": false,
        "disabled": false,
        "rate": 5
      }
      // ... more seats
    ]
  }
  // ... more rows
]`}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={importDataText}
            onChange={(e) => setImportDataText(e.target.value)}
            placeholder="Paste your JSON data here..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={importData}
            disabled={!importDataText.trim()}
          >
            Import Data
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Generate2DArrayPage;
