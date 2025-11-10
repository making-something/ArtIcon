import cron from 'node-cron';
import axios from 'axios';

const API_URL = process.env.CRON_BASE_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 8000}`;

/**
 * Initialize cron jobs
 */
export const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');

  // Process pending notifications every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running cron job: Process pending notifications');

      const response = await axios.post(`${API_URL}/api/notifications/process-pending`);

      if (response.data.success) {
        console.log('Pending notifications processed:', response.data.data);
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  });

  // Check event start and send notifications (runs every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const eventStartDate = process.env.EVENT_START_DATE || '2025-11-15T09:00:00+05:30';
      const now = new Date();
      const eventStart = new Date(eventStartDate);

      // Check if event just started (within the last minute)
      const timeDiff = now.getTime() - eventStart.getTime();
      if (timeDiff >= 0 && timeDiff < 60000) {
        console.log('Event has started! Sending notifications to all participants...');

        // Send event start notifications
        await axios.post(`${API_URL}/api/notifications/send`, {
          message: 'The Articon Hackathon 2025 has officially started! Login to your dashboard to view your tasks and start working on them. Good luck! 🚀',
          target_audience: 'all',
        });

        console.log('Event start notifications sent successfully');
      }
    } catch (error) {
      console.error('Error in event start check:', error);
    }
  });

  // Reminder for participants to submit (1 hour before event ends)
  cron.schedule('0 * * * *', async () => {
    try {
      const eventEndDate = process.env.EVENT_END_DATE || '2025-11-15T18:00:00+05:30';
      const now = new Date();
      const eventEnd = new Date(eventEndDate);

      // Check if 1 hour before event ends
      const timeDiff = eventEnd.getTime() - now.getTime();
      const oneHour = 60 * 60 * 1000;

      if (timeDiff > 0 && timeDiff <= oneHour) {
        console.log('Sending reminder: 1 hour left to submit');

        await axios.post(`${API_URL}/api/notifications/send`, {
          message: '⏰ Reminder: Only 1 hour left to submit your work! Make sure to submit before the deadline. Don\'t miss this opportunity!',
          target_audience: 'all',
        });

        console.log('Reminder notifications sent successfully');
      }
    } catch (error) {
      console.error('Error in reminder check:', error);
    }
  });

  // Initialize WhatsApp scheduled messages
  // console.log('Initializing WhatsApp scheduler...');
  // whatsappSchedulerService;

  console.log('Cron jobs initialized successfully');
};

/**
 * Stop all cron jobs
 */
export const stopCronJobs = () => {
  console.log('Stopping all cron jobs...');
  cron.getTasks().forEach((task) => task.stop());
  console.log('All cron jobs stopped');
};
