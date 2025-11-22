
// Basic types
export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

// Enums (represented as strings with CHECK constraints in SQLite)
export type Category = "video" | "ui_ux" | "graphics";
export type NotificationTarget = "all" | "winners" | "specific";
export type NotificationStatus = "pending" | "sent" | "failed";

// Participant types
export interface Participant {
	id: string;
	name: string;
	email: string;
	whatsapp_no: string;
	category: Category;
	city: string;
	portfolio_url: string | null;
	portfolio_file_path: string | null;
	is_present: boolean;
	role: string | null;
	experience: number | null;
	organization: string | null;
	specialization: string | null;
	source: string | null;
	password_hash: string | null;
	created_at: string;
	updated_at: string;
}

export interface ParticipantInsert {
	id?: string;
	name: string;
	email: string;
	whatsapp_no: string;
	category: Category;
	city: string;
	portfolio_url?: string | null;
	portfolio_file_path?: string | null;
	is_present?: boolean;
	role?: string | null;
	experience?: number | null;
	organization?: string | null;
	specialization?: string | null;
	source?: string | null;
	password_hash?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface ParticipantUpdate {
	id?: string;
	name?: string;
	email?: string;
	whatsapp_no?: string;
	category?: Category;
	city?: string;
	portfolio_url?: string | null;
	portfolio_file_path?: string | null;
	is_present?: boolean;
	role?: string | null;
	experience?: number | null;
	organization?: string | null;
	specialization?: string | null;
	source?: string | null;
	password_hash?: string | null;
	created_at?: string;
	updated_at?: string;
}

// Task types
export interface Task {
	id: string;
	category: Category;
	title: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface TaskInsert {
	id?: string;
	category: Category;
	title: string;
	description: string;
	created_at?: string;
	updated_at?: string;
}

export interface TaskUpdate {
	id?: string;
	category?: Category;
	title?: string;
	description?: string;
	created_at?: string;
	updated_at?: string;
}

// Submission types
export interface Submission {
	id: string;
	participant_id: string;
	task_id: string;
	drive_link: string;
	submitted_at: string;
	preview_url: string | null;
	score: number | null;
	created_at: string;
	updated_at: string;
}

export interface SubmissionInsert {
	id?: string;
	participant_id: string;
	task_id: string;
	drive_link: string;
	submitted_at?: string;
	preview_url?: string | null;
	score?: number | null;
	created_at?: string;
	updated_at?: string;
}

export interface SubmissionUpdate {
	id?: string;
	participant_id?: string;
	task_id?: string;
	drive_link?: string;
	submitted_at?: string;
	preview_url?: string | null;
	score?: number | null;
	created_at?: string;
	updated_at?: string;
}

// Admin types
export interface Admin {
	id: string;
	email: string;
	password_hash: string;
	created_at: string;
	updated_at: string;
}

export interface AdminInsert {
	id?: string;
	email: string;
	password_hash: string;
	created_at?: string;
	updated_at?: string;
}

export interface AdminUpdate {
	id?: string;
	email?: string;
	password_hash?: string;
	created_at?: string;
	updated_at?: string;
}

// Winner types
export interface Winner {
	id: string;
	participant_id: string;
	position: number;
	category: Category;
	announcement_text: string;
	created_at: string;
	updated_at: string;
}

export interface WinnerInsert {
	id?: string;
	participant_id: string;
	position: number;
	category: Category;
	announcement_text: string;
	created_at?: string;
	updated_at?: string;
}

export interface WinnerUpdate {
	id?: string;
	participant_id?: string;
	position?: number;
	category?: Category;
	announcement_text?: string;
	created_at?: string;
	updated_at?: string;
}

// Notification types
export interface Notification {
	id: string;
	message: string;
	scheduled_time: string;
	target_audience: NotificationTarget;
	target_ids: string[] | null;
	status: NotificationStatus;
	sent_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface NotificationInsert {
	id?: string;
	message: string;
	scheduled_time: string;
	target_audience: NotificationTarget;
	target_ids?: string[] | null;
	status?: NotificationStatus;
	sent_at?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface NotificationUpdate {
	id?: string;
	message?: string;
	scheduled_time?: string;
	target_audience?: NotificationTarget;
	target_ids?: string[] | null;
	status?: NotificationStatus;
	sent_at?: string | null;
	created_at?: string;
	updated_at?: string;
}

// Event settings types
export interface EventSetting {
	id: string;
	key: string;
	value: string;
	created_at: string;
	updated_at: string;
}

export interface EventSettingInsert {
	id?: string;
	key: string;
	value: string;
	created_at?: string;
	updated_at?: string;
}

export interface EventSettingUpdate {
	id?: string;
	key?: string;
	value?: string;
	created_at?: string;
	updated_at?: string;
}

// View types
export interface ParticipantStatistics {
	category: Category;
	total_participants: number;
	present_participants: number;
}

export interface SubmissionStatistics {
	category: Category;
	total_submissions: number;
}

