import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  eventId: '',
  guestData: [],
  guestOptions: [],
  selectedValues: [],
  seats: null,
  seatNo: 0,
  guestNo: 0,
  eventName: null,
  eventHouse: null,
  eventList: [],
  assignedSeats: [],
  isPopupVisible: false,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEventId: (state, action) => {
      state.eventId = action.payload;
    },
    setGuestData: (state, action) => {
      state.guestData = action.payload;
    },
    setGuestOptions: (state, action) => {
      state.guestOptions = action.payload;
    },
    setSelectedValues: (state, action) => {
      state.selectedValues = action.payload;
    },
    setSeats: (state, action) => {
      state.seats = action.payload;
    },
    setSeatNo: (state, action) => {
      state.seatNo = action.payload;
    },
    setGuestNo: (state, action) => {
      state.guestNo = action.payload;
    },
    setEventName: (state, action) => {
      state.eventName = action.payload;
    },
    setEventHouse: (state, action) => {
      state.eventHouse = action.payload;
    },
    setEventList: (state, action) => {
      state.eventList = action.payload;
    },
    setAssignedSeats: (state, action) => {
      state.assignedSeats = action.payload;
    },
    setIsPopupVisible: (state, action) => {
      state.isPopupVisible = action.payload;
    },
  },
});

export const {
  setEventId,
  setGuestData,
  setGuestOptions,
  setSelectedValues,
  setSeats,
  setSeatNo,
  setGuestNo,
  setEventName,
  setEventHouse,
  setEventList,
  setAssignedSeats,
  setIsPopupVisible,
} = eventSlice.actions;

export default eventSlice.reducer;