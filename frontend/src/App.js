import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Layout and Pages
import Layout from "./components/Layout/Layout";
import HomePage from "./components/pages/HomePage";
import SeatingPlanPage from "./components/pages/SeatingPlanPage";
import EventCreatePage from "./components/pages/EventCreatePage";
import SeatAssign from "./components/pages/SeatAssign";
import Generate2DArrayPage from "./components/pages/Generate2DArrayPage";

import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/seating-plan" element={<SeatingPlanPage />} />
              <Route path="/event-create" element={<EventCreatePage />} />
              <Route path="/seat-assign" element={<SeatAssign />} />
              <Route path="/generate-2d-array" element={<Generate2DArrayPage />} />
            </Routes>
          </Layout>
        </Router>
      </Provider>
    </ThemeProvider>
  );
}
export default App;
