# ArtIcon Registration & Login Integration Guide

## Overview
This guide explains how the frontend registration/login system is connected to the backend API.

## Changes Made

### 1. Backend Updates

#### Database Schema (`backend/migration-update-participants.sql`)
Added new columns to the `participants` table:
- `role` - Participant role (Student, Professional, Freelancer)
- `experience` - Years of experience (integer)
- `organization` - Organization or college name
- `specialization` - Field of specialization (UI/UX Design, Video Editing, Graphic Design)
- `source` - How they heard about the competition
- `password_hash` - Hashed password for authentication

#### TypeScript Types (`backend/src/types/database.ts`)
Updated the `participants` table types to include all new fields.

#### Participant Controller (`backend/src/controllers/participant.controller.ts`)
- **Registration endpoint** (`POST /api/participants/register`):
  - Now accepts: `fullName`, `email`, `phone`, `city`, `portfolio`, `role`, `experience`, `organization`, `specialization`, `source`, `password`
  - Maps `specialization` to `category` (Video Editing → video, UI/UX Design → ui_ux, Graphic Design → graphics)
  - Hashes password using bcrypt before storing
  - Returns success response with participant data

- **Login endpoint** (`POST /api/participants/login`):
  - Changed from email + whatsapp_no to email + password authentication
  - Verifies password using bcrypt
  - Returns JWT token and participant data on success

### 2. Frontend Updates

#### API Service (`frontend/src/services/api.js`)
Created a centralized API service with the following functions:
- `registerParticipant(formData)` - Register new participant
- `loginParticipant(email, password)` - Login participant
- `logout()` - Clear authentication data
- `getCurrentParticipant()` - Get logged-in participant from localStorage
- `isAuthenticated()` - Check if user is logged in
- `getParticipantById(id)` - Fetch participant by ID
- `checkEventStatus()` - Check if event has started

#### Registration Page (`frontend/src/app/registration/page.jsx`)
- Integrated with API service
- Added loading states during submission
- Added error handling with user-friendly messages
- Stores JWT token and participant data in localStorage on successful login
- Redirects to home page after successful login
- Shows "Registering..." and "Logging in..." states

#### Styling (`frontend/src/app/registration/registration.css`)
- Added disabled button styles
- Prevents interaction during submission

### 3. Environment Configuration

#### Frontend (`.env.local.example`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Create a `.env.local` file in the `frontend` directory with this content.

## Setup Instructions

### 1. Run Database Migration
```bash
cd backend
# Connect to your Supabase database and run:
psql -h <your-supabase-host> -U postgres -d postgres -f migration-update-participants.sql
```

Or use Supabase SQL Editor to run the migration script.

### 2. Configure Frontend Environment
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL to your backend URL
```

### 3. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:8000
```

### 4. Start Frontend Server
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

## API Endpoints

### Registration
```http
POST http://localhost:8000/api/participants/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+919999999999",
  "city": "Mumbai",
  "portfolio": "https://portfolio.example.com",
  "role": "Student",
  "experience": 2,
  "organization": "ABC College",
  "specialization": "UI/UX Design",
  "source": "Social Media (IG/LinkedIn)",
  "password": "securepassword123"
}
```

### Login
```http
POST http://localhost:8000/api/participants/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

## Testing

1. Navigate to `http://localhost:3000/registration`
2. Fill out the registration form
3. Set a password
4. Complete registration
5. Login with your credentials
6. You should be redirected to the home page

## Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens are stored in localStorage
- Tokens are automatically included in API requests via Authorization header
- Backend validates all required fields
- Email uniqueness is enforced

## Troubleshooting

### CORS Issues
Make sure your backend allows requests from your frontend URL. Check `backend/src/index.ts` CORS configuration.

### Database Connection
Verify your Supabase credentials in `backend/.env` file.

### API Not Responding
- Check if backend server is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check browser console for network errors

## Next Steps

- Add email verification
- Implement password reset functionality
- Add form validation on frontend
- Create protected routes for authenticated users
- Build participant dashboard

