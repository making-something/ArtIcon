import * as cron from 'node-cron';
import whatsappService from './whatsapp.service';

export class WhatsAppSchedulerService {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    // Temporarily disabled to prevent server crash
    // TODO: Fix cron scheduling and re-enable
    console.log('🕐 WhatsApp scheduler temporarily disabled to prevent crashes');
  }

  /**
   * Initialize all scheduled messages
   */
  private initializeScheduledMessages(): void {
    console.log('🕐 Initializing WhatsApp scheduled messages...');

    // Daily morning reminder
    this.scheduleJob(
      'daily-morning-reminder',
      '0 9 * * *', // 9:00 AM every day
      async () => {
        await this.sendDailyReminder();
      }
    );

    // Event start notification (when event starts) - disabled due to cron issues
    // this.scheduleJob(
    //   'event-start-notification',
    //   '0 9 * * 15', // 9:00 AM on 15th of every month (assuming event starts Nov 15)
    //   async () => {
    //     await this.sendEventStartNotification();
    //   }
    // );

    // Deadline reminders
    this.scheduleJob(
      'deadline-reminder',
      '0 18 * * *', // 6:00 PM every day
      async () => {
        await this.sendDeadlineReminder();
      }
    );

    // Weekly check-in
    this.scheduleJob(
      'weekly-checkin',
      '0 10 * * 1', // 10:00 AM every Monday
      async () => {
        await this.sendWeeklyCheckin();
      }
    );

    console.log(`✅ Scheduled ${this.scheduledJobs.size} WhatsApp message jobs`);
  }

  /**
   * Schedule a job
   */
  private scheduleJob(name: string, cronExpression: string, callback: () => Promise<void>): void {
    if (this.scheduledJobs.has(name)) {
      console.log(`⚠️  Job ${name} already exists, skipping...`);
      return;
    }

    try {
      const task = cron.schedule(cronExpression, callback, {
        timezone: 'UTC' // Explicitly set UTC to avoid timezone issues
      });

      this.scheduledJobs.set(name, task);
      console.log(`📅 Scheduled job: ${name} (${cronExpression})`);
    } catch (error) {
      console.error(`❌ Failed to schedule job ${name}:`, error);
    }
  }

  /**
   * Send daily reminder message
   */
  private async sendDailyReminder(): Promise<void> {
    try {
      const message = `🌅 Good Morning Articon Participants! ☀️

📝 Today's Reminder:
• Check your dashboard for new tasks
• Work on your submissions
• Don't forget submission deadlines

💪 Keep up the great work!
🏆 Exciting prizes await the winners!

Need help? Contact our support team.

Articon Hackathon 2025 🚀`;

      const sentCount = await whatsappService.sendMessageToAll(message);
      console.log(`📱 Sent daily morning reminder to ${sentCount} participants`);
    } catch (error) {
      console.error('❌ Error sending daily reminder:', error);
    }
  }

  
  /**
   * Send deadline reminder
   */
  private async sendDeadlineReminder(): Promise<void> {
    try {
      const message = `⏰ DEADLINE REMINDER! ⏰

📅 Submission deadline approaching!

✅ Checklist:
• Review task requirements
• Complete your submissions
• Test everything works
• Submit before deadline

⚠️ Late submissions may not be considered
🏆 Your hard work deserves recognition!

Last chance to shine! ✨

Articon Hackathon 2025`;

      const sentCount = await whatsappService.sendMessageToAll(message);
      console.log(`📱 Sent deadline reminder to ${sentCount} participants`);
    } catch (error) {
      console.error('❌ Error sending deadline reminder:', error);
    }
  }

  /**
   * Send weekly check-in
   */
  private async sendWeeklyCheckin(): Promise<void> {
    try {
      const message = `📊 WEEKLY CHECK-IN! 📊

Hello Articon Participants! 👋

🎯 How's your progress?
• Tasks completed?
• Need any help?
• Facing any challenges?

💡 Remember:
• We're here to help
• Collaboration is key
• Innovation matters most

📞 Need assistance? Reach out to our team!

Keep pushing forward! 💪

Articon Hackathon 2025`;

      const sentCount = await whatsappService.sendMessageToAll(message);
      console.log(`📱 Sent weekly check-in to ${sentCount} participants`);
    } catch (error) {
      console.error('❌ Error sending weekly check-in:', error);
    }
  }

  /**
   * Send category specific messages
   */
  async sendMessageToCategories(): Promise<void> {
    const categories = ['video', 'ui_ux', 'graphics'];

    const categoryMessages = {
      video: `🎬 Video Editing Category Update!

📹 Focus on:
• Storytelling
• Visual effects
• Audio quality
• Creative editing

🏆 Best video wins exciting prizes!

Articon Hackathon 2025`,

      ui_ux: `🎨 UI/UX Design Category Update!

✨ Focus on:
• User experience
• Visual design
• Innovation
• Usability

🏆 Best design wins amazing rewards!

Articon Hackathon 2025`,

      graphics: `🖼️ Graphic Design Category Update!

🎨 Focus on:
• Creativity
• Technical skills
• Originality
• Impact

🏆 Best graphics win fantastic prizes!

Articon Hackathon 2025`
    };

    for (const category of categories) {
      try {
        const message = categoryMessages[category as keyof typeof categoryMessages];
        const sentCount = await whatsappService.sendMessageToCategory(category, message);
        console.log(`📱 Sent ${category} category update to ${sentCount} participants`);
      } catch (error) {
        console.error(`❌ Error sending ${category} message:`, error);
      }
    }
  }

  /**
   * Send custom scheduled message
   */
  async scheduleCustomMessage(
    name: string,
    cronExpression: string,
    message: string,
    targetType: 'all' | 'category' | 'phone',
    targetValue?: string
  ): Promise<boolean> {
    try {
      if (this.scheduledJobs.has(name)) {
        console.log(`⚠️  Job ${name} already exists`);
        return false;
      }

      this.scheduleJob(name, cronExpression, async () => {
        let sentCount = 0;

        switch (targetType) {
          case 'all':
            sentCount = await whatsappService.sendMessageToAll(message);
            break;
          case 'category':
            if (targetValue) {
              sentCount = await whatsappService.sendMessageToCategory(targetValue, message);
            }
            break;
          case 'phone':
            if (targetValue) {
              const success = await whatsappService.sendMessage(targetValue, message);
              sentCount = success ? 1 : 0;
            }
            break;
        }

        console.log(`📱 Custom message "${name}" sent to ${sentCount} recipients`);
      });

      return true;
    } catch (error) {
      console.error('❌ Error scheduling custom message:', error);
      return false;
    }
  }

  /**
   * Cancel a scheduled job
   */
  cancelJob(name: string): boolean {
    try {
      const job = this.scheduledJobs.get(name);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(name);
        console.log(`🛑 Cancelled scheduled job: ${name}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Get all scheduled jobs
   */
  getScheduledJobs(): { name: string; status: string }[] {
    return Array.from(this.scheduledJobs.entries()).map(([name]) => ({
      name,
      status: 'Active'
    }));
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllJobs(): void {
    console.log('🛑 Stopping all WhatsApp scheduled jobs...');

    this.scheduledJobs.forEach((job, name) => {
      job.stop();
      console.log(`  - Stopped: ${name}`);
    });

    this.scheduledJobs.clear();
    console.log('✅ All scheduled jobs stopped');
  }

  /**
   * Restart all scheduled jobs
   */
  restartAllJobs(): void {
    console.log('🔄 Restarting WhatsApp scheduled jobs...');
    this.stopAllJobs();
    this.initializeScheduledMessages();
  }
}

export default new WhatsAppSchedulerService();