-- Initial database schema for Articon Hackathon

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Categories enum (SQLite doesn't have enums, so we'll use CHECK constraints)
-- Values: 'video', 'ui_ux', 'graphics'

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp_no TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('video', 'ui_ux', 'graphics')),
  city TEXT NOT NULL,
  portfolio_url TEXT,
  portfolio_file_path TEXT,
  is_present BOOLEAN DEFAULT FALSE,
  role TEXT,
  experience INTEGER DEFAULT 0,
  organization TEXT,
  specialization TEXT,
  source TEXT,
  password_hash TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_at TEXT,
  rejected_at TEXT,
  admin_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('video', 'ui_ux', 'graphics')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);


-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  drive_link TEXT NOT NULL,
  submitted_at TEXT DEFAULT (datetime('now')),
  preview_url TEXT,
  score INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(participant_id, task_id) -- One submission per participant per task
);

-- Winners table
CREATE TABLE IF NOT EXISTS winners (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('video', 'ui_ux', 'graphics')),
  announcement_text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(participant_id, category) -- One winner per participant per category
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'winners', 'specific')),
  target_ids TEXT, -- JSON array of participant IDs for 'specific' audience
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Event settings table
CREATE TABLE IF NOT EXISTS event_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_category ON participants(category);
CREATE INDEX IF NOT EXISTS idx_participants_is_present ON participants(is_present);
CREATE INDEX IF NOT EXISTS idx_participants_approval_status ON participants(approval_status);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);


CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

CREATE INDEX IF NOT EXISTS idx_submissions_participant_id ON submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_participant_task ON submissions(participant_id, task_id);

CREATE INDEX IF NOT EXISTS idx_winners_participant_id ON winners(participant_id);
CREATE INDEX IF NOT EXISTS idx_winners_category ON winners(category);
CREATE INDEX IF NOT EXISTS idx_winners_position ON winners(position);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_time ON notifications(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_event_settings_key ON event_settings(key);

-- Create views for statistics (SQLite doesn't have materialized views, so regular views)

-- Participant statistics view
CREATE VIEW IF NOT EXISTS participant_statistics AS
SELECT
  category,
  COUNT(*) as total_participants,
  COUNT(CASE WHEN is_present = 1 THEN 1 END) as present_participants
FROM participants
GROUP BY category;

-- Submission statistics view
CREATE VIEW IF NOT EXISTS submission_statistics AS
SELECT
  t.category,
  COUNT(s.id) as total_submissions
FROM tasks t
LEFT JOIN submissions s ON t.id = s.task_id
GROUP BY t.category;

-- Create database functions (SQLite functions)


-- Update timestamps trigger
CREATE TRIGGER IF NOT EXISTS update_timestamps
AFTER UPDATE ON participants
BEGIN
  UPDATE participants SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tasks_timestamps
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
END;


CREATE TRIGGER IF NOT EXISTS update_admins_timestamps
AFTER UPDATE ON admins
BEGIN
  UPDATE admins SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_submissions_timestamps
AFTER UPDATE ON submissions
BEGIN
  UPDATE submissions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_winners_timestamps
AFTER UPDATE ON winners
BEGIN
  UPDATE winners SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_notifications_timestamps
AFTER UPDATE ON notifications
BEGIN
  UPDATE notifications SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_event_settings_timestamps
AFTER UPDATE ON event_settings
BEGIN
  UPDATE event_settings SET updated_at = datetime('now') WHERE id = NEW.id;
END;