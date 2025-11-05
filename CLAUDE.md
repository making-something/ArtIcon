# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the backend API for the Articon Hackathon platform - a comprehensive hackathon management system built with Node.js, Express, TypeScript, and Supabase. The system handles participant registration, task management, submissions, judging, and notifications.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with hot reload using nodemon and tsx
- `pnpm build` - Build TypeScript to `dist/` directory with path aliases
- `pnpm start` - Run production server from built files
- `pnpm type-check` - Run TypeScript type checking without emitting files
- `pnpm lint` - Lint TypeScript files with ESLint

### Database Management
- `pnpm setup-db` - Interactive database setup script (requires manual SQL execution in Supabase dashboard)
- `pnpm create-admin` - Create admin account interactively

### Utilities
- `pnpm clean` - Remove build artifacts from `dist/`

## Architecture Overview

### Core Structure
The application follows a layered architecture:

- **Entry Point**: `src/index.ts` - Express server setup with Socket.IO for real-time features
- **Routes**: `src/routes/` - API endpoints organized by user role (admin, judge, participant, etc.)
- **Controllers**: `src/controllers/` - Business logic handlers for each route
- **Services**: `src/services/` - External integrations (email, WhatsApp, notifications)
- **Middleware**: `src/middleware/` - Authentication and request processing
- **Types**: `src/types/` - TypeScript definitions including complete Supabase database schema

### Database Integration
Uses Supabase as the database with two clients:
- `supabase` - Public client respecting Row Level Security (RLS)
- `supabaseAdmin` - Service role client bypassing RLS for backend operations

Database schema includes 8 main tables: participants, tasks, submissions, judges, admins, winners, notifications, and event_settings.

### Real-time Features
Socket.IO integration for:
- Admin room updates
- Judge-specific notifications
- Real-time event monitoring

### External Services
- **Email Service**: AWS SES integration (currently logging-only, needs production setup)
- **WhatsApp Service**: Meta Business API webhook integration (currently logging-only)
- **Cron Jobs**: Scheduled notifications and event management

## Key Configuration

### Path Aliases
TypeScript path mapping configured for clean imports:
- `@/*` → `src/*`
- `@config/*` → `src/config/*`
- `@controllers/*` → `src/controllers/*`
- etc.

### Environment Variables Required
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `FRONTEND_URL` - Frontend application URL for CORS
- `PORT` - Server port (defaults to 8000)

## Database Schema

### Core Entities
- **Participants**: Hackathon registrants with categories (video, ui_ux, graphics)
- **Tasks**: Category-specific challenges for participants
- **Submissions**: Participant work linked to tasks and judges
- **Judges**: Assigned to review submissions with workload balancing
- **Admins**: System administrators with full access
- **Winners**: Event results and announcements
- **Notifications**: Scheduled messaging system
- **Event Settings**: Configuration key-value store

### Categories
Three competition categories: `video`, `ui_ux`, `graphics`

## API Structure

### Route Organization
- `/api/participants` - Registration and participant management
- `/api/submissions` - File uploads and submission tracking
- `/api/admin` - Administrative operations (tasks, judges, winners)
- `/api/judge` - Judge portal and review operations
- `/api/notifications` - Notification management
- `/webhook/whatsapp` - Meta WhatsApp webhook endpoint

### Authentication
JWT-based authentication with role-based access control (admin, judge, participant).

## Development Workflow

### Initial Setup
1. Configure Supabase project and update environment variables
2. Run `pnpm setup-db` and execute the generated SQL in Supabase dashboard
3. Run `pnpm create-admin` to create first admin account
4. Start development with `pnpm dev`

### Testing
Health check endpoint available at `/health` for basic connectivity testing.

## Current Status

The backend API is 95% complete with all core functionality implemented. Main pending items are:
- Email service production configuration
- WhatsApp service production setup
- Frontend admin panel implementation
- Task creation for all categories

See `PENDING.md` for detailed task list and priorities.

## Important Notes

- The codebase uses strict TypeScript with comprehensive type definitions
- All database operations use the Supabase client with proper error handling
- File uploads are handled via Google Drive links (not direct file storage)
- The system includes comprehensive audit trails and timestamps
- Real-time features are implemented but require frontend integration