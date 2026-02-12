# Algorand App

Complete Algorand-based application with separated backend and dual frontend architecture for users and event organizers.

## Project Structure

```
algorand-app/
├── backend/           (Express server - Port 3000)
│   ├── server.js
│   ├── api-js/
│   ├── config/
│   ├── db/
│   ├── middleware/
│   ├── analysis/
│   └── package.json
├── user_frontend/     (React/Vite - Port 5173)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── organiser_frontend/ (React/Vite - Port 5174)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── package.json
└── README.md
```

## Quick Start

### Install All Dependencies

```bash
npm run install-all
```

### Run Backend (Terminal 1)

```bash
npm run dev-backend
```

Server runs on: `http://localhost:3000`

### Run User Frontend (Terminal 2)

```bash
npm run dev-user
```

App runs on: `http://localhost:5173`

### Run Organiser Frontend (Terminal 3)

```bash
npm run dev-organiser
```

App runs on: `http://localhost:5174`

## Individual Setup

### Backend Setup

```bash
cd backend
npm install
npm start
```

### User Frontend Setup

```bash
cd user_frontend
npm install
npm run dev
```

### Organiser Frontend Setup

```bash
cd organiser_frontend
npm install
npm run dev
```

## API Endpoints

### Organiser Routes
- `GET /api/organiser/events` - Get all organiser events
- `POST /api/organiser/events/create` - Create new event
- `GET /api/organiser/events/:eventId` - Get event details
- `PUT /api/organiser/events/:eventId` - Update event
- `DELETE /api/organiser/events/:eventId` - Delete event
- `GET /api/organiser/events/:eventId/holders` - Get ticket holders
- `POST /api/organiser/events/:eventId/checkin/:ticketId` - Check in ticket
- `GET /api/organiser/events/:eventId/analytics` - Get event analytics

### User App Routes
- `/api/events` - Event browsing
- `/api/groups` - Group management
- `/api/tickets` - Ticket management
- `/api/payments` - Payment processing
- `/api/analysis` - Financial analysis
- `/api/activity` - Activity logs
- `/api/categories` - Expense categories

## Features

### User App (Port 5173)
- Browse and purchase event tickets
- Group expense management
- Activity tracking
- Financial analysis
- Event management
- Algorand wallet integration

### Organiser App (Port 5174)
- Create and manage events
- Ticket pricing and distribution
- Attendee tracking
- Check-in management
- Event analytics and insights

## Technology Stack

- **Backend**: Node.js, Express, SQLite/MySQL
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Algorand SDK
- **Payment**: Algorand ASA (Asset)

## Environment Variables

### Backend (.env in root or backend/)
```
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

### User Frontend (.env in user_frontend/)
```
VITE_API_URL=http://localhost:3000/api
```

### Organiser Frontend (.env in organiser_frontend/)
```
VITE_API_URL=http://localhost:3000/api
```

## Build for Production

### Build User Frontend
```bash
npm run build-user
```

### Build Organiser Frontend
```bash
npm run build-organiser
```

