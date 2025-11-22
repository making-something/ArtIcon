import db from '@/config/database';
import {
  Participant, ParticipantInsert, ParticipantUpdate,
  Task, TaskInsert, TaskUpdate,
  Submission, SubmissionInsert, SubmissionUpdate,
  Admin, AdminInsert,
  Winner,
  Notification, NotificationInsert,
  EventSetting,
  ParticipantStatistics, SubmissionStatistics,
  Category, NotificationStatus
} from '@/types/database';

class DatabaseService {
  // Generate UUID for new records
  private generateId(): string {
    return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ===== PARTICIPANTS =====

  async getParticipantById(id: string): Promise<Participant | null> {
    const stmt = db.prepare('SELECT * FROM participants WHERE id = ?');
    return stmt.get(id) as Participant | null;
  }

  async getParticipantByEmail(email: string): Promise<Participant | null> {
    const stmt = db.prepare('SELECT * FROM participants WHERE email = ?');
    return stmt.get(email) as Participant | null;
  }

  async getParticipants(filters: {
    category?: Category;
    is_present?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ participants: Participant[]; total: number }> {
    let query = 'SELECT * FROM participants WHERE 1=1';
    const params: any[] = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.is_present !== undefined) {
      query += ' AND is_present = ?';
      params.push(filters.is_present ? 1 : 0);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR city LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count
    const countStmt = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*)'));
    const totalResult = countStmt.get(params) as { count: number };
    const total = totalResult.count;

    // Add pagination
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(filters.limit, offset);
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const stmt = db.prepare(query);
    const participants = stmt.all(...params) as Participant[];

    return { participants, total };
  }

  async createParticipant(data: ParticipantInsert): Promise<Participant> {
    const id = data.id || this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO participants (
        id, name, email, whatsapp_no, category, city, portfolio_url,
        portfolio_file_path, is_present, role, experience,
        organization, specialization, source, password_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.name, data.email, data.whatsapp_no, data.category, data.city,
      data.portfolio_url || null, data.portfolio_file_path || null,
      data.is_present ? 1 : 0, data.role || null,
      data.experience || 0, data.organization || null,
      data.specialization || null, data.source || null,
      data.password_hash || null, now, now
    );

    const participant = await this.getParticipantById(id);
    if (!participant) throw new Error('Failed to create participant');
    return participant;
  }

  async updateParticipant(id: string, data: ParticipantUpdate): Promise<Participant | null> {
    const fields = Object.keys(data).filter(key => key !== 'id');
    if (fields.length === 0) return await this.getParticipantById(id);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (data as any)[field]);
    values.push(id); // For WHERE clause

    const stmt = db.prepare(`
      UPDATE participants
      SET ${setClause}, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(...values);
    return await this.getParticipantById(id);
  }

  // ===== TASKS =====

  async getAllTasks(category?: Category): Promise<Task[]> {
    let query = 'SELECT * FROM tasks';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at ASC';
    const stmt = db.prepare(query);
    return stmt.all(...params) as Task[];
  }

  async getTaskById(id: string): Promise<Task | null> {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | null;
  }

  async createTask(data: TaskInsert): Promise<Task> {
    const id = data.id || this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO tasks (id, category, title, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.category, data.title, data.description, now, now);
    const task = await this.getTaskById(id);
    if (!task) throw new Error('Failed to create task');
    return task;
  }

  async updateTask(id: string, data: TaskUpdate): Promise<Task | null> {
    const fields = Object.keys(data).filter(key => key !== 'id');
    if (fields.length === 0) return await this.getTaskById(id);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (data as any)[field]);
    values.push(id);

    const stmt = db.prepare(`
      UPDATE tasks
      SET ${setClause}, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(...values);
    return await this.getTaskById(id);
  }

  async deleteTask(id: string): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  
  // ===== ADMINS =====

  async getAdminById(id: string): Promise<Admin | null> {
    const stmt = db.prepare('SELECT * FROM admins WHERE id = ?');
    return stmt.get(id) as Admin | null;
  }

  async getAdminByEmail(email: string): Promise<Admin | null> {
    const stmt = db.prepare('SELECT * FROM admins WHERE email = ?');
    return stmt.get(email) as Admin | null;
  }

  async createAdmin(data: AdminInsert): Promise<Admin> {
    const id = data.id || this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO admins (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.email, data.password_hash, now, now);
    const admin = await this.getAdminById(id);
    if (!admin) throw new Error('Failed to create admin');
    return admin;
  }

  // ===== SUBMISSIONS =====

  async getSubmissionById(id: string): Promise<(Submission & {
    participant: Participant;
    task: Task;
  }) | null> {
    const stmt = db.prepare(`
      SELECT
        s.*,
        p.id as participant_id, p.name as participant_name, p.email as participant_email,
        p.whatsapp_no as participant_whatsapp_no, p.category as participant_category, p.city as participant_city,
        p.portfolio_url as participant_portfolio_url, p.portfolio_file_path as participant_portfolio_file_path,
        p.is_present as participant_is_present, p.role as participant_role, p.experience as participant_experience,
        p.organization as participant_organization, p.specialization as participant_specialization, p.source as participant_source,
        p.password_hash as participant_password_hash, p.created_at as participant_created_at, p.updated_at as participant_updated_at,
        t.id as task_id, t.category as task_category, t.title as task_title, t.description as task_description,
        t.created_at as task_created_at, t.updated_at as task_updated_at
      FROM submissions s
      LEFT JOIN participants p ON s.participant_id = p.id
      LEFT JOIN tasks t ON s.task_id = t.id
      WHERE s.id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      participant_id: row.participant_id,
      task_id: row.task_id,
      drive_link: row.drive_link,
      submitted_at: row.submitted_at,
      preview_url: row.preview_url,
      score: row.score,
      created_at: row.created_at,
      updated_at: row.updated_at,
      participant: {
        id: row.participant_id,
        name: row.participant_name,
        email: row.participant_email,
        whatsapp_no: row.participant_whatsapp_no,
        category: row.participant_category,
        city: row.participant_city,
        portfolio_url: row.participant_portfolio_url,
        portfolio_file_path: row.participant_portfolio_file_path,
        is_present: row.participant_is_present,
        role: row.participant_role,
        experience: row.participant_experience,
        organization: row.participant_organization,
        specialization: row.participant_specialization,
        source: row.participant_source,
        password_hash: row.participant_password_hash,
        created_at: row.participant_created_at,
        updated_at: row.participant_updated_at,
      },
      task: {
        id: row.task_id,
        category: row.task_category,
        title: row.task_title,
        description: row.task_description,
        created_at: row.task_created_at,
        updated_at: row.task_updated_at,
      },
    };
  }

  async createSubmission(data: SubmissionInsert): Promise<Submission> {
    const id = data.id || this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO submissions (
        id, participant_id, task_id, drive_link, submitted_at,
        preview_url, score, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.participant_id, data.task_id, data.drive_link,
      data.submitted_at || now, data.preview_url || null,
      data.score || null, now, now
    );

    const submission = await this.getSubmissionById(id);
    if (!submission) throw new Error('Failed to create submission');
    return submission;
  }

  async updateSubmission(id: string, data: SubmissionUpdate): Promise<Submission | null> {
    const fields = Object.keys(data).filter(key => key !== 'id');
    if (fields.length === 0) return await this.getSubmissionById(id);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (data as any)[field]);
    values.push(id);

    const stmt = db.prepare(`
      UPDATE submissions
      SET ${setClause}, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(...values);
    return await this.getSubmissionById(id);
  }

  async deleteSubmission(id: string): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM submissions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getSubmissionByParticipantAndTask(participantId: string, taskId: string): Promise<Submission | null> {
    const stmt = db.prepare('SELECT * FROM submissions WHERE participant_id = ? AND task_id = ?');
    return stmt.get(participantId, taskId) as Submission | null;
  }

  // ===== STATISTICS =====

  async getParticipantStatistics(): Promise<ParticipantStatistics[]> {
    const stmt = db.prepare('SELECT * FROM participant_statistics');
    return stmt.all() as ParticipantStatistics[];
  }

  async getSubmissionStatistics(): Promise<SubmissionStatistics[]> {
    const stmt = db.prepare('SELECT * FROM submission_statistics');
    return stmt.all() as SubmissionStatistics[];
  }

  async getDashboardStats() {
    const totalParticipants = db.prepare('SELECT COUNT(*) as count FROM participants').get() as { count: number };
    const presentParticipants = db.prepare('SELECT COUNT(*) as count FROM participants WHERE is_present = 1').get() as { count: number };
    const totalSubmissions = db.prepare('SELECT COUNT(*) as count FROM submissions').get() as { count: number };

    const categoryStats = await this.getParticipantStatistics();
    const submissionStats = await this.getSubmissionStatistics();

    return {
      totalParticipants: totalParticipants.count,
      presentParticipants: presentParticipants.count,
      totalSubmissions: totalSubmissions.count,
      categoryStats,
      submissionStats,
    };
  }

  // ===== NOTIFICATIONS =====

  async createNotification(data: NotificationInsert): Promise<Notification> {
    const id = data.id || this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO notifications (
        id, message, scheduled_time, target_audience, target_ids,
        status, sent_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.message, data.scheduled_time, data.target_audience,
      data.target_ids ? JSON.stringify(data.target_ids) : null,
      data.status || 'pending', data.sent_at || null, now, now
    );

    const notification = await this.getNotificationById(id);
    if (!notification) throw new Error('Failed to create notification');
    return notification;
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    const stmt = db.prepare('SELECT * FROM notifications WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      ...row,
      target_ids: row.target_ids ? JSON.parse(row.target_ids) : null,
    };
  }

  async getAllNotifications(status?: NotificationStatus): Promise<Notification[]> {
    let query = 'SELECT * FROM notifications';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY scheduled_time DESC';
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      ...row,
      target_ids: row.target_ids ? JSON.parse(row.target_ids) : null,
    }));
  }

  // ===== EVENT SETTINGS =====

  async getEventSettings(): Promise<Record<string, string>> {
    const stmt = db.prepare('SELECT * FROM event_settings');
    const rows = stmt.all() as EventSetting[];

    const settings: Record<string, string> = {};
    rows.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    return settings;
  }

  async updateEventSetting(key: string, value: string): Promise<EventSetting> {
    const now = new Date().toISOString();

    const updateStmt = db.prepare(`
      UPDATE event_settings
      SET value = ?, updated_at = ?
      WHERE key = ?
    `);

    const result = updateStmt.run(value, now, key);

    if (result.changes === 0) {
      // Insert new setting
      const id = this.generateId();
      const insertStmt = db.prepare(`
        INSERT INTO event_settings (id, key, value, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertStmt.run(id, key, value, now, now);
    }

    const stmt = db.prepare('SELECT * FROM event_settings WHERE key = ?');
    return stmt.get(key) as EventSetting;
  }

  // ===== WINNERS =====

  async getWinnerById(id: string): Promise<(Winner & { participant: Participant }) | null> {
    const stmt = db.prepare(`
      SELECT
        w.*,
        p.id as participant_id, p.name as participant_name, p.email as participant_email,
        p.whatsapp_no, p.category as participant_category, p.city,
        p.portfolio_url, p.portfolio_file_path, p.is_present,
        p.whatsapp_opt_in, p.whatsapp_opt_in_at, p.whatsapp_opt_in_source,
        p.whatsapp_opt_out_at, p.role, p.experience, p.organization,
        p.specialization, p.source, p.password_hash,
        p.created_at as participant_created_at, p.updated_at as participant_updated_at
      FROM winners w
      LEFT JOIN participants p ON w.participant_id = p.id
      WHERE w.id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      participant_id: row.participant_id,
      position: row.position,
      category: row.category,
      announcement_text: row.announcement_text,
      created_at: row.created_at,
      updated_at: row.updated_at,
      participant: {
        id: row.participant_id,
        name: row.participant_name,
        email: row.participant_email,
        whatsapp_no: row.whatsapp_no,
        category: row.participant_category,
        city: row.city,
        portfolio_url: row.portfolio_url,
        portfolio_file_path: row.portfolio_file_path,
        is_present: row.is_present,
        role: row.role,
        experience: row.experience,
        organization: row.organization,
        specialization: row.specialization,
        source: row.source,
        password_hash: row.password_hash,
        created_at: row.participant_created_at,
        updated_at: row.participant_updated_at,
      },
    };
  }

  async createWinner(data: { participant_id: string; position: number; category: Category; announcement_text: string }): Promise<Winner & { participant: Participant }> {
    const id = this.generateId();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO winners (id, participant_id, position, category, announcement_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.participant_id, data.position, data.category, data.announcement_text, now, now);

    const winner = await this.getWinnerById(id);
    if (!winner) throw new Error('Failed to create winner');
    return winner;
  }

  async deleteWinner(id: string): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM winners WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getAllWinners(category?: Category): Promise<(Winner & { participant: Participant })[]> {
    let query = `
      SELECT
        w.*,
        p.id as participant_id, p.name as participant_name, p.email as participant_email,
        p.whatsapp_no, p.category as participant_category, p.city,
        p.portfolio_url, p.portfolio_file_path, p.is_present,
        p.role, p.experience, p.organization,
        p.specialization, p.source, p.password_hash,
        p.created_at as participant_created_at, p.updated_at as participant_updated_at
      FROM winners w
      LEFT JOIN participants p ON w.participant_id = p.id
    `;

    const params: any[] = [];

    if (category) {
      query += ' WHERE w.category = ?';
      params.push(category);
    }

    query += ' ORDER BY w.position ASC';
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      participant_id: row.participant_id,
      position: row.position,
      category: row.category,
      announcement_text: row.announcement_text,
      created_at: row.created_at,
      updated_at: row.updated_at,
      participant: {
        id: row.participant_id,
        name: row.participant_name,
        email: row.participant_email,
        whatsapp_no: row.whatsapp_no,
        category: row.participant_category,
        city: row.city,
        portfolio_url: row.portfolio_url,
        portfolio_file_path: row.portfolio_file_path,
        is_present: row.is_present,
        role: row.role,
        experience: row.experience,
        organization: row.organization,
        specialization: row.specialization,
        source: row.source,
        password_hash: row.password_hash,
        created_at: row.participant_created_at,
        updated_at: row.participant_updated_at,
      },
    }));
  }
}

export const databaseService = new DatabaseService();