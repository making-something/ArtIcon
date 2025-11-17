# Articon Hackathon API Documentation

**Base URL:** `http://localhost:8000`
**Version:** 1.0.0

## Table of Contents
- [Authentication](#authentication)
- [Health & Status](#health--status)
- [Participants](#participants)
- [Submissions](#submissions)
- [Judge](#judge)
- [Admin](#admin)
- [Notifications](#notifications)
- [Upload](#upload)
- [WhatsApp](#whatsapp)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Roles
- `participant` - Regular hackathon participants
- `judge` - Judges evaluating submissions
- `admin` - System administrators

---

## Health & Status

### Get API Status
```http
GET /
```

**Response:**
```json
{
  "success": true,
  "message": "Articon Hackathon API is running",
  "version": "1.0.0",
  "timestamp": "2025-11-17T09:57:51.062Z"
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-17T09:55:40.511Z"
}
```

---

## Participants

### Register Participant
```http
POST /api/participants/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "whatsapp_no": "+919999999999",
  "category": "ui_ux",
  "city": "Mumbai",
  "portfolio_url": "https://portfolio.example.com"
}
```

**Valid Categories:** `video`, `ui_ux`, `graphics`

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "b0e85323-5ae9-4276-b12c-8e5e65e2b590",
    "name": "John Doe",
    "email": "john@example.com",
    "category": "ui_ux"
  }
}
```

### Login Participant
```http
POST /api/participants/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "whatsapp_no": "+919999999999"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "participant": {
    "id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
    "name": "John Doe",
    "email": "john@example.com",
    "category": "ui_ux",
    "city": "Mumbai"
  }
}
```

### Check Event Status
```http
GET /api/participants/event-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasStarted": true,
    "eventStartDate": "2025-11-15T03:30:00.000Z",
    "currentTime": "2025-11-17T09:57:52.491Z",
    "timeUntilStart": 0
  }
}
```

### Get All Participants
```http
GET /api/participants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
      "name": "John Doe",
      "email": "john@example.com",
      "whatsapp_no": "+919999999999",
      "category": "ui_ux",
      "city": "Mumbai",
      "portfolio_url": "https://portfolio.example.com",
      "is_present": false,
      "created_at": "2025-11-10T06:40:42.459619+00:00",
      "updated_at": "2025-11-10T06:40:42.459619+00:00",
      "whatsapp_opt_in": null,
      "whatsapp_opt_in_at": null
    }
  ],
  "count": 14
}
```

### Get Participant by ID
```http
GET /api/participants/:id
```

**Example:** `GET /api/participants/8579ddbb-02cf-4525-9e5f-3e766845111b`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
    "name": "John Doe",
    "email": "john@example.com",
    "whatsapp_no": "+919999999999",
    "category": "ui_ux",
    "city": "Mumbai",
    "portfolio_url": "https://portfolio.example.com",
    "is_present": false
  }
}
```

### Get Participant by Email
```http
GET /api/participants/email/:email
```

**Example:** `GET /api/participants/email/john@example.com`

### Get Participant Tasks
```http
GET /api/participants/:id/tasks
```

**Example:** `GET /api/participants/8579ddbb-02cf-4525-9e5f-3e766845111b/tasks`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "d4fe7091-ba6b-442e-b37f-5571ffa59a91",
      "category": "ui_ux",
      "title": "Mobile Banking App Redesign",
      "description": "Design a complete mobile banking application...",
      "created_at": "2025-11-05T11:47:56.925667+00:00",
      "updated_at": "2025-11-05T11:47:56.925667+00:00"
    }
  ]
}
```

### Get Participant Statistics
```http
GET /api/participants/stats/all
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "video",
      "total_participants": 11,
      "present_participants": 1
    },
    {
      "category": "ui_ux",
      "total_participants": 4,
      "present_participants": 0
    }
  ]
}
```

### Update Participant Presence
```http
PATCH /api/participants/:id/presence
```

**Auth:** Admin only

**Request Body:**
```json
{
  "is_present": true
}
```

### Send WhatsApp Opt-In Message
```http
POST /api/participants/:id/send-optin
```

**Auth:** Admin only

---

## Submissions

### Create Submission
```http
POST /api/submissions
```

**Request Body:**
```json
{
  "participant_id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
  "task_id": "d4fe7091-ba6b-442e-b37f-5571ffa59a91",
  "drive_link": "https://drive.google.com/file/d/test123/view"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission created successfully",
  "data": {
    "id": "aa4dd645-f14f-4e0d-9fcd-a2dc24ce61a8",
    "participant_id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
    "task_id": "d4fe7091-ba6b-442e-b37f-5571ffa59a91",
    "judge_id": null,
    "drive_link": "https://drive.google.com/file/d/test123/view",
    "preview_url": "https://drive.google.com/file/d/test123/view",
    "submitted_at": "2025-11-17T09:59:23.568225+00:00",
    "score": null
  }
}
```

### Get All Submissions
```http
GET /api/submissions
```

**Query Parameters:**
- `participant_id` - Filter by participant
- `task_id` - Filter by task
- `judge_id` - Filter by judge
- `category` - Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "aa4dd645-f14f-4e0d-9fcd-a2dc24ce61a8",
      "participant_id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
      "task_id": "d4fe7091-ba6b-442e-b37f-5571ffa59a91",
      "judge_id": "baa71645-baf9-4e32-83e0-3970fe019c33",
      "drive_link": "https://drive.google.com/file/d/test123/view",
      "preview_url": "https://drive.google.com/file/d/test123/view",
      "submitted_at": "2025-11-17T09:59:23.568225+00:00",
      "score": 95,
      "participant": { },
      "task": { },
      "judge": { }
    }
  ],
  "count": 2
}
```

### Get Submission by ID
```http
GET /api/submissions/:id
```

### Get Submissions by Participant
```http
GET /api/submissions/participant/:participant_id
```

**Example:** `GET /api/submissions/participant/8579ddbb-02cf-4525-9e5f-3e766845111b`

### Get Submissions by Judge
```http
GET /api/submissions/judge/:judge_id
```

### Update Submission
```http
PUT /api/submissions/:id
```

**Request Body:**
```json
{
  "drive_link": "https://drive.google.com/file/d/updated123/view",
  "score": 85
}
```

**Note:** `drive_link` is required in the request body.

### Delete Submission
```http
DELETE /api/submissions/:id
```

**Auth:** Admin only

### Get Submission Statistics
```http
GET /api/submissions/stats/all
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "video",
      "total_submissions": 1
    },
    {
      "category": "graphics",
      "total_submissions": 0
    },
    {
      "category": "ui_ux",
      "total_submissions": 1
    }
  ]
}
```

### Reassign Submission to Judge
```http
PATCH /api/submissions/:id/reassign
```

**Auth:** Admin only

**Request Body:**
```json
{
  "judge_id": "baa71645-baf9-4e32-83e0-3970fe019c33"
}
```

---

## Judge

### Judge Login
```http
POST /api/judge/login
```

**Request Body:**
```json
{
  "email": "judge@example.com",
  "password": "judge123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "judge": {
      "id": "baa71645-baf9-4e32-83e0-3970fe019c33",
      "name": "Test Judge",
      "email": "judge@example.com",
      "assigned_count": 2
    }
  }
}
```

### Get Judge Profile
```http
GET /api/judge/profile
```

**Auth:** Judge token required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "baa71645-baf9-4e32-83e0-3970fe019c33",
    "name": "Test Judge",
    "email": "judge@example.com",
    "assigned_count": 3,
    "created_at": "2025-11-05T12:03:00.097155+00:00"
  }
}
```

### Get Assigned Submissions
```http
GET /api/judge/submissions
```

**Auth:** Judge token required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "aa4dd645-f14f-4e0d-9fcd-a2dc24ce61a8",
      "participant": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "task": {
        "title": "Mobile Banking App Redesign",
        "description": "..."
      },
      "drive_link": "https://drive.google.com/file/d/test123/view",
      "submitted_at": "2025-11-17T09:59:23.568225+00:00",
      "score": null
    }
  ],
  "count": 3
}
```

### Get Submission Details by ID
```http
GET /api/judge/submissions/:id
```

**Auth:** Judge token required

### Get Judge Statistics
```http
GET /api/judge/statistics
```

**Auth:** Judge token required

### Update Judge Password
```http
PUT /api/judge/password
```

**Auth:** Judge token required

**Request Body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass456"
}
```

---

## Admin

### Admin Login
```http
POST /api/admin/login
```

**Request Body:**
```json
{
  "email": "admin@articon.com",
  "password": "admin123"
}
```

### Create Admin Account
```http
POST /api/admin/create
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@articon.com",
  "password": "securepass123"
}
```

### Create Judge Account
```http
POST /api/admin/judges
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "name": "Judge Name",
  "email": "judge@example.com",
  "password": "judge123"
}
```

### Get All Judges
```http
GET /api/admin/judges
```

**Auth:** Admin token required

### Delete Judge
```http
DELETE /api/admin/judges/:id
```

**Auth:** Admin token required

### Create Task
```http
POST /api/admin/tasks
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "title": "Mobile Banking App Redesign",
  "description": "Design a complete mobile banking application...",
  "category": "ui_ux"
}
```

### Get All Tasks
```http
GET /api/admin/tasks
```

**Auth:** Admin token required

### Update Task
```http
PUT /api/admin/tasks/:id
```

**Auth:** Admin token required

### Delete Task
```http
DELETE /api/admin/tasks/:id
```

**Auth:** Admin token required

### Announce Winner
```http
POST /api/admin/winners
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "submission_id": "aa4dd645-f14f-4e0d-9fcd-a2dc24ce61a8",
  "position": 1,
  "prize": "First Prize - $1000"
}
```

### Get All Winners
```http
GET /api/admin/winners
```

**Auth:** Admin token required

### Delete Winner
```http
DELETE /api/admin/winners/:id
```

**Auth:** Admin token required

### Update Event Settings
```http
PUT /api/admin/settings
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "event_start_date": "2025-11-20T10:00:00Z",
  "event_end_date": "2025-11-21T18:00:00Z",
  "registration_open": true
}
```

### Get Event Settings
```http
GET /api/admin/settings
```

**Auth:** Admin token required

### Get Dashboard Statistics
```http
GET /api/admin/dashboard/stats
```

**Auth:** Admin token required

**Response:**
```json
{
  "success": true,
  "data": {
    "total_participants": 14,
    "total_submissions": 2,
    "total_judges": 1,
    "present_participants": 1,
    "by_category": {
      "video": {
        "participants": 11,
        "submissions": 1
      },
      "ui_ux": {
        "participants": 4,
        "submissions": 1
      }
    }
  }
}
```

---

## Notifications

### Schedule Notification
```http
POST /api/notifications/schedule
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "title": "Event Reminder",
  "message": "The event starts in 1 hour!",
  "scheduled_at": "2025-11-20T09:00:00Z",
  "target_audience": "all",
  "channels": ["email", "whatsapp"]
}
```

**Target Audience Options:** `all`, `video`, `ui_ux`, `graphics`, `present`, `absent`

### Send Immediate Notification
```http
POST /api/notifications/send
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "title": "Urgent Announcement",
  "message": "Please gather at the main hall",
  "target_audience": "present",
  "channels": ["whatsapp"]
}
```

### Get All Notifications
```http
GET /api/notifications
```

**Auth:** Admin token required

### Get Notification by ID
```http
GET /api/notifications/:id
```

**Auth:** Admin token required

### Update Notification
```http
PUT /api/notifications/:id
```

**Auth:** Admin token required

### Delete Notification
```http
DELETE /api/notifications/:id
```

**Auth:** Admin token required

### Process Pending Notifications
```http
POST /api/notifications/process-pending
```

**Note:** This endpoint is typically called by cron jobs

---

## Upload

### Submit File
```http
POST /api/upload/submit
```

**Auth:** Participant token required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` - The file to upload (max 100MB)
- `task_id` - The task ID for the submission

**Accepted File Types:**
- Video: `.mp4`, `.mov`, `.avi`, `.mkv`
- Graphics: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.psd`, `.ai`
- UI/UX: `.fig`, `.xd`, `.sketch`, `.pdf`, `.png`, `.jpg`

**Response:**
```json
{
  "success": true,
  "message": "File uploaded and submission created successfully",
  "data": {
    "submission": { },
    "driveInfo": {
      "fileId": "1abc123def456",
      "webViewLink": "https://drive.google.com/file/d/1abc123def456/view",
      "previewUrl": "https://drive.google.com/file/d/1abc123def456/preview"
    }
  }
}
```

### Validate Drive Link
```http
POST /api/upload/validate-link
```

**Request Body:**
```json
{
  "drive_link": "https://drive.google.com/file/d/test123/view"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "error": "File not found or not accessible. Please ensure the Google Drive link is public."
  }
}
```

---

## WhatsApp

### Verify Webhook (Meta Verification)
```http
GET /webhook/whatsapp
```

**Query Parameters:**
- `hub.mode` - Should be "subscribe"
- `hub.verify_token` - Verification token
- `hub.challenge` - Challenge string to echo back

### Handle Webhook (Receive Messages)
```http
POST /webhook/whatsapp
```

**Note:** This endpoint receives incoming WhatsApp messages from Meta's webhook

### Send Message to Phone
```http
POST /api/whatsapp-simple/send/phone
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "phone": "+919999999999",
  "message": "Hello from Articon Hackathon!"
}
```

### Send Message to Participant
```http
POST /api/whatsapp-simple/send/participant
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "participant_id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
  "message": "Your submission has been received!"
}
```

### Send Message to Category
```http
POST /api/whatsapp-simple/send/category
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "category": "ui_ux",
  "message": "All UI/UX participants please gather for briefing"
}
```

### Send Message to All Participants
```http
POST /api/whatsapp-simple/send/all
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "message": "Event starts in 15 minutes!"
}
```

### Send Bulk Messages
```http
POST /api/whatsapp-simple/send/bulk
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "messages": [
    {
      "phone": "+919999999999",
      "message": "Custom message 1"
    },
    {
      "participant_id": "8579ddbb-02cf-4525-9e5f-3e766845111b",
      "message": "Custom message 2"
    }
  ]
}
```

### Test WhatsApp Message
```http
POST /api/whatsapp-simple/test
```

**Request Body:**
```json
{
  "phone": "+919999999999",
  "message": "Test message"
}
```

### Get WhatsApp Participants
```http
GET /api/whatsapp-simple/participants
```

**Auth:** Admin token required

### Get WhatsApp Service Status
```http
GET /api/whatsapp-simple/status
```

**Auth:** Admin token required

### Get Scheduler Jobs
```http
GET /api/whatsapp-simple/scheduler/jobs
```

**Auth:** Admin token required

### Schedule Custom Message
```http
POST /api/whatsapp-simple/scheduler/custom
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "cron": "0 10 * * *",
  "message": "Daily reminder at 10 AM",
  "target": "all",
  "name": "Daily Morning Reminder"
}
```

### Cancel Scheduler Job
```http
POST /api/whatsapp-simple/scheduler/cancel
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "job_name": "Daily Morning Reminder"
}
```

### Restart Scheduler
```http
POST /api/whatsapp-simple/scheduler/restart
```

**Auth:** Admin token required

### Send Category-Specific Messages
```http
POST /api/whatsapp-simple/scheduler/categories
```

**Auth:** Admin token required

**Request Body:**
```json
{
  "categories": {
    "video": "Video editing workshop starts now!",
    "ui_ux": "UI/UX design session begins in 10 minutes",
    "graphics": "Graphics design competition kickoff"
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## WebSocket Events (Socket.IO)

The API uses Socket.IO for real-time updates.

**Connection URL:** `http://localhost:8000`

### Events

#### Join Admin Room
```javascript
socket.emit('join-admin');
```

#### Join Judge Room
```javascript
socket.emit('join-judge', judgeId);
```

#### Real-time Updates
The server emits events to rooms when:
- New submissions are created
- Submissions are scored
- Participants check-in/out

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting for production use.

---

## Notes

1. **CORS:** The API allows requests from `http://localhost:3000`, `http://localhost:5500`, and `http://127.0.0.1:5500`
2. **File Upload:** Maximum file size is 100MB
3. **JWT Expiration:** Tokens expire after 7 days
4. **Google Drive:** File uploads require proper Google service account configuration
5. **WhatsApp:** Requires Meta Business API credentials and webhook verification

---

## Test Credentials

### Participant
- Email: `dhairya@demo.com`
- WhatsApp: `+919664847885`

### Judge
- Email: `judge@example.com`
- Password: `judge123`

### Admin
- Email: `admin@articon.com` (check database for actual credentials)
- Password: Contact system administrator

---

## Environment Variables Required

```env
NODE_ENV=production
PORT=8000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
EMAIL_FROM=noreply@yourdomain.com
```
