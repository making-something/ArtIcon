# Articon Hackathon Platform

A comprehensive hackathon management system built with Node.js, Express, TypeScript, and Supabase. Features participant registration, task management, file submissions, judge assignment, and admin controls.

## 🚀 Features

### For Participants
- **Registration Form**: Easy sign-up with category selection (Video, UI/UX, Graphics)
- **Personal Dashboard**: View assigned tasks and submission status
- **File Upload**: Submit work via Google Drive integration
- **Real-time Updates**: Live status tracking

### For Administrators
- **Admin Portal**: Complete event management dashboard
- **Participant Management**: Track attendance and manage registrations
- **Task Management**: Create and assign tasks by category
- **Submission Review**: Monitor all submissions and their status
- **Judge Assignment**: Automatic workload balancing

### For Judges
- **Review Interface**: Preview submissions via Google Drive
- **Scoring System**: Rate submissions 0-100
- **Workload Management**: Balanced assignment of submissions
- **Review History**: Edit and update completed reviews

## 📋 Prerequisites

- Node.js 18+
- pnpm package manager
- Supabase account
- Google Cloud Service Account (for Drive integration)

## 🛠️ Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd articon2
   pnpm install
   ```

2. **Environment Setup**:
   Create a `.env` file with:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   FRONTEND_URL=http://localhost:8000
   PORT=8000

   # Google Drive Integration (optional)
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_PROJECT_ID=your_google_cloud_project_id
   ```

3. **Database Setup**:
   ```bash
   pnpm setup-db
   ```
   This will generate SQL that you need to run in your Supabase dashboard.

4. **Create Admin Account**:
   ```bash
   pnpm create-admin
   ```

5. **Setup Sample Tasks**:
   ```bash
   pnpm setup-tasks
   ```

## 🎯 Usage

### Starting the Server
```bash
pnpm dev
```

### Accessing the Platform

1. **Participant Portal**: http://localhost:8000/participant.html
   - Register for the hackathon
   - View and submit tasks
   - Upload files via Google Drive

2. **Admin Portal**: http://localhost:8000/admin.html
   - Login with admin credentials
   - Manage participants and tasks
   - Monitor submissions and reviews

### Default Login
- **Admin**: Use credentials created with `pnpm create-admin`
- **Participants**: Register through the participant portal

## 📁 Project Structure

```
articon2/
├── src/
│   ├── controllers/     # Business logic handlers
│   ├── routes/         # API endpoints
│   ├── services/       # External integrations
│   ├── middleware/     # Authentication & validation
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Helper functions
│   └── config/         # Database configuration
├── public/
│   ├── participant.html # Participant frontend
│   ├── admin.html      # Admin frontend
│   └── submit.html     # Submission page
├── scripts/
│   ├── setup-database.ts
│   ├── create-admin.ts
│   └── setup-tasks.ts
└── uploads/            # Temporary file storage
```

## 🔧 Configuration

### Google Drive Integration (Optional)

1. Create a Google Cloud Service Account
2. Enable Google Drive API
3. Create a service account key
4. Share a folder with the service account
5. Add credentials to `.env`

Without Google Drive setup, participants can still submit using manual Google Drive links.

### Database Schema

The system uses 8 main tables:
- `participants`: Hackathon registrants
- `tasks`: Category-specific challenges
- `submissions`: Participant work with judge assignments
- `judges`: Review panel with workload tracking
- `admins`: System administrators
- `winners`: Event results
- `notifications`: Messaging system
- `event_settings`: Configuration store

## 🎨 Categories

Three competition categories are supported:

1. **Video**: Video production, editing, motion graphics
2. **UI/UX**: Interface design, user experience, prototyping
3. **Graphics**: Visual design, illustrations, graphics

## 📊 API Endpoints

### Participants
- `POST /api/participants/register` - Register new participant
- `GET /api/participants/:id/tasks` - Get participant's tasks
- `GET /api/participants/stats/all` - Participant statistics

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/tasks` - Manage tasks
- `GET /api/admin/judges` - Manage judges

### Submissions
- `POST /api/upload/submit` - Upload file and submit
- `GET /api/submissions` - Get all submissions
- `PUT /api/submissions/:id` - Update submission with score

### Judges
- `POST /api/judge/login` - Judge authentication
- `GET /api/judge/submissions` - Get assigned submissions

## 🔄 Development Workflow

1. **Development Mode**: `pnpm dev`
2. **Type Checking**: `pnpm type-check`
3. **Linting**: `pnpm lint`
4. **Build**: `pnpm build`
5. **Production Start**: `pnpm start`

## 🚨 Important Notes

- The system uses JWT tokens for authentication
- File uploads are handled via Google Drive integration
- Judge assignments are automatically balanced
- Real-time features use Socket.IO (ready for frontend integration)
- Email and WhatsApp services are configured for production use

## 📝 TODO

- [ ] Configure AWS SES for email production
- [ ] Set up Meta WhatsApp API
- [ ] Add comprehensive error handling
- [ ] Implement rate limiting
- [ ] Add automated testing
- [ ] Create React/Next.js frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.