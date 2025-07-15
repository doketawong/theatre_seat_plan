# Theatre Seat Management System - Frontend

This React application provides a comprehensive theatre seat management system with routing and Material-UI components.

## Features

### 🏠 Home Page (`/`)
- Dashboard with navigation cards for all main features
- Modern Material-UI design with hover effects
- Quick access to all application functions

### 🎭 Seating Plan Management (`/seating-plan`)
- Interactive seating arrangement visualization
- Seat selection and management
- Real-time availability tracking

### 📄 Event Creation (`/upload-event`)
- Create new theatre events
- Upload participant data from CSV files
- Event configuration and setup

### 🎯 Seat Assignment (`/seat-assign`)
- Automatic seat assignment algorithm
- Guest management with Redux state
- Real-time seat availability tracking
- Assignment optimization based on seating preferences

### 📊 Generate 2D Array (`/generate-array`)
- Generate custom seating layouts
- Configurable rows and columns
- Export seating arrangements as JSON
- Visual preview of generated layouts

## Navigation

The application uses a responsive Material-UI layout with:
- **Desktop**: Persistent side navigation drawer
- **Mobile**: Collapsible navigation drawer
- **AppBar**: Main application header
- **Breadcrumb navigation**: Easy navigation between sections

## Technical Stack

- **React 18** with functional components and hooks
- **Material-UI (MUI) v5** for component library and theming
- **React Router v6** for client-side routing
- **Redux Toolkit** for state management
- **React Redux** for connecting components to state

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application

## Routing Structure

```
/                    → HomePage
/seating-plan        → SeatingPlanPage
/upload-event        → EventCreatePage
/seat-assign         → SeatAssign
/generate-array      → Generate2DArrayPage
```

## Components Structure

```
src/
├── App.js                 # Main app with routing setup
├── components/
│   ├── Layout/
│   │   └── Layout.js      # Main layout with navigation
│   └── pages/
│       ├── HomePage.js           # Landing page with feature cards
│       ├── SeatingPlanPage.js    # Seating plan management
│       ├── EventCreatePage.js    # Event creation interface
│       ├── SeatAssign.js         # Seat assignment functionality
│       └── Generate2DArrayPage.js # 2D array generation tool
└── redux/
    ├── store.js           # Redux store configuration
    └── feature/
        └── eventSlice.js  # Event management state
```

## Key Features

### Responsive Design
- Mobile-first approach with Material-UI responsive components
- Adaptive navigation for different screen sizes
- Touch-friendly interface elements

### State Management
- Centralized state management with Redux Toolkit
- Efficient state updates and component re-rendering
- Persistent state across route navigation

### Modern UI/UX
- Material Design principles
- Consistent color scheme and typography
- Smooth animations and transitions
- Accessible component interactions

## Dependencies

- `@mui/material` - Material-UI components
- `@mui/icons-material` - Material-UI icons
- `@emotion/react` & `@emotion/styled` - CSS-in-JS styling
- `react-router-dom` - Client-side routing
- `@reduxjs/toolkit` - Redux state management
- `react-redux` - React-Redux bindings
