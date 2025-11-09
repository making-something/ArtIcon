const readline = require('readline');

const BASE_URL = 'http://localhost:8000';
const WHATSAPP_API = BASE_URL + '/api/whatsapp-simple';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask for input
function askQuestion(question) {
  return new Promise((resolve) => {
    if (rl.closed) {
      resolve('');
      return;
    }
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Format phone number (add +91 if needed)
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');

  // Remove +91 if already present
  if (cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }

  // Add +91 prefix
  return '91' + cleaned;
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL + '/health');
    const data = await response.json();
    return data.success;
  } catch (error) {
    return false;
  }
}

// Send WhatsApp message
async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log('Sending message to +' + formattedNumber + '...');

    const response = await fetch(WHATSAPP_API + '/send/phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: formattedNumber,
        message: message
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Message sent successfully!');
      return true;
    } else {
      console.log('Failed to send message: ' + result.error);
      return false;
    }
  } catch (error) {
    console.error('Error: ' + error.message);
    return false;
  }
}

// Send message to category
async function sendToCategory(category, message) {
  try {
    console.log('Sending message to ' + category + ' category...');

    const response = await fetch(WHATSAPP_API + '/send/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: category,
        message: message
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Message sent to ' + result.sentCount + ' participants in ' + category + ' category');
      return true;
    } else {
      console.log('Failed to send message: ' + result.error);
      return false;
    }
  } catch (error) {
    console.error('Error: ' + error.message);
    return false;
  }
}

// Get participants
async function getParticipants() {
  try {
    const response = await fetch(WHATSAPP_API + '/participants');
    const result = await response.json();

    if (result.success) {
      console.log('\nRegistered Participants:');
      result.participants.forEach((p, index) => {
        console.log((index + 1) + '. ' + p.name + ' (' + p.category + ') - +' + p.whatsapp_no);
      });
      console.log('\nTotal: ' + result.count + ' participants');
    } else {
      console.log('Failed to get participants');
    }
  } catch (error) {
    console.error('Error: ' + error.message);
  }
}

// Main interactive menu
async function main() {
  console.log('WhatsApp Interactive Test Tool');
  console.log('================================');

  // Check if server is running
  console.log('\nChecking server status...');
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('Server is not running! Please start it with: pnpm dev');
    process.exit(1);
  }

  console.log('Server is running!');

  while (true) {
    console.log('\nChoose an option:');
    console.log('1. Send message to specific number');
    console.log('2. Send message to category');
    console.log('3. View participants');
    console.log('4. Exit');

    const choice = await askQuestion('\nEnter your choice (1-4): ');

    switch (choice) {
      case '1':
        await handleDirectMessage();
        break;
      case '2':
        await handleCategoryMessage();
        break;
      case '3':
        await getParticipants();
        break;
      case '4':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid choice. Please try again.');
    }

    console.log('\n' + '-'.repeat(50));
  }
}

// Handle direct message
async function handleDirectMessage() {
  const phoneNumber = await askQuestion('Enter phone number (e.g., 9099325885): ');

  if (!phoneNumber) {
    console.log('Phone number is required');
    return;
  }

  console.log('\nEnter your message (type END to finish):');
  console.log('-'.repeat(40));

  let message = '';
  while (true) {
    const line = await askQuestion('');
    if (line.toUpperCase() === 'END') {
      break;
    }
    message += line + '\n';
  }

  message = message.trim();

  if (!message) {
    console.log('Message is required');
    return;
  }

  await sendWhatsAppMessage(phoneNumber, message);
}

// Handle category message
async function handleCategoryMessage() {
  const category = await askQuestion('Enter category (video, ui_ux, graphics): ');

  if (!category || !['video', 'ui_ux', 'graphics'].includes(category)) {
    console.log('Invalid category');
    return;
  }

  console.log('\nEnter your message (type END to finish):');
  console.log('-'.repeat(40));

  let message = '';
  while (true) {
    const line = await askQuestion('');
    if (line.toUpperCase() === 'END') {
      break;
    }
    message += line + '\n';
  }

  message = message.trim();

  if (!message) {
    console.log('Message is required');
    return;
  }

  await sendToCategory(category, message);
}

// Start the app
main();