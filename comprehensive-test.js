const axios = require('axios');
const readline = require('readline');

const BASE_URL = 'http://localhost:8000';

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

// Helper to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test data storage
let testData = {
  adminToken: null,
  judgeToken: null,
  participantToken: null,
  participantId: null,
  taskId: null,
  submissionId: null,
  judgeId: null,
  createdTasks: [],
  createdParticipants: [],
  createdJudges: [],
  createdSubmissions: []
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n📍 ${step}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// API request helper
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Health check
async function testHealthCheck() {
  logStep('Testing Health Check');
  const result = await apiRequest('GET', '/health');

  if (result.success && result.data.success) {
    logSuccess('Health check passed');
    logInfo(`Server info: ${JSON.stringify(result.data, null, 2)}`);
    return true;
  } else {
    logError('Health check failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Admin authentication
async function testAdminAuth() {
  logStep('Testing Admin Authentication');

  // Test login
  const loginResult = await apiRequest('POST', '/api/admin/login', {
    email: 'dhairya@mail.com',
    password: 'dhairya3391'
  });

  if (loginResult.success) {
    testData.adminToken = loginResult.data.data.token;
    logSuccess('Admin login successful');
    logInfo(`Token received: ${testData.adminToken.substring(0, 20)}...`);
    return true;
  } else {
    logError('Admin login failed');
    logError(JSON.stringify(loginResult.error));
    return false;
  }
}

// Dashboard stats
async function testDashboardStats() {
  logStep('Testing Dashboard Stats');

  // Refresh admin token
  await refreshAdminToken();

  const result = await apiRequest('GET', '/api/admin/dashboard/stats', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success && (result.data.data || result.data)) {
    logSuccess('Dashboard stats retrieved');
    logInfo(`Stats: ${JSON.stringify(result.data.data || result.data, null, 2)}`);
    return true;
  } else {
    logError('Failed to get dashboard stats');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Participant registration
async function testParticipantRegistration() {
  logStep('Testing Participant Registration');

  const participantData = {
    name: `Test Participant ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    whatsapp_no: `919${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    category: 'video',
    city: 'Test City',
    portfolio_url: `https://test${Date.now()}.com`
  };

  const result = await apiRequest('POST', '/api/participants/register', participantData);

  if (result.success && result.data.data) {
    testData.participantId = result.data.data.id;
    testData.createdParticipants.push(result.data.data);
    logSuccess('Participant registered successfully');
    logInfo(`Participant ID: ${result.data.data.id}`);
    return true;
  } else {
    logError('Participant registration failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Participant login
async function refreshAdminToken() {
  const result = await apiRequest('POST', '/api/admin/login', {
    email: 'dhairya@mail.com',
    password: 'dhairya3391'
  });

  if (result.success && result.data.data.token) {
    testData.adminToken = result.data.data.token;
    logInfo(`Token refreshed: ${testData.adminToken.substring(0, 20)}...`);
    return true;
  } else {
    logError(`Token refresh failed: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testParticipantLogin() {
  logStep('Testing Participant Login');

  if (!testData.createdParticipants.length) {
    logWarning('No participants to test login with');
    return false;
  }

  const participant = testData.createdParticipants[0];
  logInfo(`Attempting login with email: ${participant.email}, whatsapp: ${participant.whatsapp_no}`);

  const result = await apiRequest('POST', '/api/participants/login', {
    email: participant.email,
    whatsapp_no: participant.whatsapp_no
  });

  if (result.success && result.data.token) {
    testData.participantToken = result.data.token;
    logSuccess('Participant login successful');
    return true;
  } else {
    logError('Participant login failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Get participant tasks
async function testParticipantTasks() {
  logStep('Testing Participant Tasks');

  if (!testData.participantId) {
    logWarning('No participant ID to test tasks');
    return false;
  }

  const result = await apiRequest('GET', `/api/participants/${testData.participantId}/tasks`);

  if (result.success) {
    logSuccess('Participant tasks retrieved');
    logInfo(`Tasks: ${JSON.stringify(result.data, null, 2)}`);
    if (result.data.length > 0) {
      testData.taskId = result.data[0].id;
    }
    return true;
  } else {
    logError('Failed to get participant tasks');
    return false;
  }
}

// Task creation (admin)
async function testTaskCreation() {
  logStep('Testing Task Creation');

  // Refresh admin token
  await refreshAdminToken();

  const taskData = {
    title: `Test Task ${Date.now()}`,
    description: 'This is a test task created during automated testing',
    category: 'video',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    max_score: 100,
    requirements: ['Requirement 1', 'Requirement 2', 'Requirement 3']
  };

  const result = await apiRequest('POST', '/api/admin/tasks', taskData, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success && (result.data.data || result.data)) {
    const taskData = result.data.data || result.data;
    testData.taskId = taskData.id;
    testData.createdTasks.push(taskData);
    logSuccess('Task created successfully');
    logInfo(`Task ID: ${taskData.id}`);
    return true;
  } else {
    logError('Task creation failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Get all tasks
async function testGetAllTasks() {
  logStep('Testing Get All Tasks');

  // Refresh admin token
  await refreshAdminToken();

  const result = await apiRequest('GET', '/api/admin/tasks', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success) {
    logSuccess('All tasks retrieved');
    logInfo(`Total tasks: ${result.data.length}`);
    return true;
  } else {
    logError('Failed to get all tasks');
    return false;
  }
}

// Judge creation
async function testJudgeCreation() {
  logStep('Testing Judge Creation');

  // Refresh admin token
  await refreshAdminToken();

  const judgeData = {
    name: `Test Judge ${Date.now()}`,
    email: `judge${Date.now()}@example.com`,
    password: 'judge123',
    categories: ['video'],
    phone: `919${Math.floor(Math.random() * 9000000000) + 1000000000}`
  };

  const result = await apiRequest('POST', '/api/admin/judges', judgeData, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success) {
    const judgeData = result.data.data || result.data;
    testData.judgeId = judgeData.id;
    testData.createdJudges.push(judgeData);
    logSuccess('Judge created successfully');
    logInfo(`Judge ID: ${judgeData.id}`);
    return true;
  } else {
    logError('Judge creation failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Judge authentication
async function testJudgeAuth() {
  logStep('Testing Judge Authentication');

  if (!testData.createdJudges.length) {
    logWarning('No judges to test authentication with');
    return false;
  }

  const judge = testData.createdJudges[0];
  const result = await apiRequest('POST', '/api/judge/login', {
    email: judge.email,
    password: 'judge123'
  });

  if (result.success) {
    testData.judgeToken = result.data.token;
    logSuccess('Judge login successful');
    return true;
  } else {
    logError('Judge login failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Get judge assignments
async function testJudgeAssignments() {
  logStep('Testing Judge Assignments');

  if (!testData.judgeToken) {
    logWarning('No judge token to test assignments');
    return false;
  }

  const result = await apiRequest('GET', '/api/judge/assignments', null, {
    'Authorization': `Bearer ${testData.judgeToken}`
  });

  if (result.success) {
    logSuccess('Judge assignments retrieved');
    logInfo(`Assignments: ${JSON.stringify(result.data, null, 2)}`);
    return true;
  } else {
    logError('Failed to get judge assignments');
    return false;
  }
}

// Submission creation
async function testSubmissionCreation() {
  logStep('Testing Submission Creation');

  if (!testData.participantId || !testData.taskId) {
    logWarning('Missing participant ID or task ID for submission');
    return false;
  }

  const submissionData = {
    participant_id: testData.participantId,
    task_id: testData.taskId,
    drive_link: `https://drive.google.com/file/d/test${Date.now()}/view`
  };

  const result = await apiRequest('POST', '/api/submissions', submissionData);

  if (result.success) {
    testData.submissionId = result.data.id;
    testData.createdSubmissions.push(result.data);
    logSuccess('Submission created successfully');
    logInfo(`Submission ID: ${result.data.id}`);
    return true;
  } else {
    logError('Submission creation failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Get submissions
async function testGetSubmissions() {
  logStep('Testing Get Submissions');

  // Refresh admin token
  await refreshAdminToken();

  const result = await apiRequest('GET', '/api/submissions', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success) {
    logSuccess('Submissions retrieved');
    logInfo(`Total submissions: ${result.data.length}`);
    return true;
  } else {
    logError('Failed to get submissions');
    return false;
  }
}

// Update submission score
async function testUpdateSubmissionScore() {
  logStep('Testing Update Submission Score');

  if (!testData.submissionId) {
    logWarning('No submission ID to update score');
    return false;
  }

  const result = await apiRequest('PUT', `/api/submissions/${testData.submissionId}`, {
    score: 85,
    feedback: 'Good work! Some improvements needed.'
  }, {
    'Authorization': `Bearer ${testData.judgeToken || testData.adminToken}`
  });

  if (result.success) {
    logSuccess('Submission score updated');
    return true;
  } else {
    logError('Failed to update submission score');
    return false;
  }
}

// WhatsApp messaging
async function testWhatsAppMessaging() {
  logStep('Testing WhatsApp Messaging');

  // Refresh admin token
  await refreshAdminToken();

  const testResult = await apiRequest('POST', '/api/whatsapp-simple/test', {
    phoneNumber: '919099325885'
  }, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (testResult.success) {
    logSuccess('WhatsApp test message sent');
    return true;
  } else {
    logWarning('WhatsApp test failed (might be expected in dev mode)');
    logError(JSON.stringify(testResult.error));
    return false;
  }
}

// Get participants list
async function testGetParticipants() {
  logStep('Testing Get Participants List');

  // Refresh admin token
  await refreshAdminToken();

  const result = await apiRequest('GET', '/api/whatsapp-simple/participants', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success) {
    logSuccess('Participants list retrieved');
    logInfo(`Total participants: ${result.data.count}`);
    return true;
  } else {
    logError('Failed to get participants list');
    return false;
  }
}

// Winner creation
async function testWinnerCreation() {
  logStep('Testing Winner Creation');

  if (!testData.participantId) {
    logWarning('No participant ID for winner creation');
    return false;
  }

  // Refresh admin token
  await refreshAdminToken();

  const winnerData = {
    participant_id: testData.participantId,
    category: 'video',
    position: 1,
    announcement_text: 'Congratulations on winning First Prize - Video Editing! Best Creative Work!'
  };

  const result = await apiRequest('POST', '/api/admin/winners', winnerData, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success) {
    logSuccess('Winner created successfully');
    return true;
  } else {
    logError('Winner creation failed');
    logError(JSON.stringify(result.error));
    return false;
  }
}

// Get winners
async function testGetWinners() {
  logStep('Testing Get Winners');

  // Refresh admin token
  await refreshAdminToken();

  const result = await apiRequest('GET', '/api/admin/winners', null, {
    'Authorization': `Bearer ${testData.adminToken}`
  });

  if (result.success) {
    logSuccess('Winners retrieved');
    logInfo(`Total winners: ${result.data.length}`);
    return true;
  } else {
    logError('Failed to get winners');
    return false;
  }
}

// Cleanup test data
async function cleanupTestData() {
  logStep('Cleaning Up Test Data');

  const cleanupTasks = [];

  // Clean up submissions
  for (const submission of testData.createdSubmissions) {
    cleanupTasks.push(
      apiRequest('DELETE', `/api/submissions/${submission.id}`, null, {
        'Authorization': `Bearer ${testData.adminToken}`
      })
    );
  }

  // Clean up tasks
  for (const task of testData.createdTasks) {
    cleanupTasks.push(
      apiRequest('DELETE', `/api/admin/tasks/${task.id}`, null, {
        'Authorization': `Bearer ${testData.adminToken}`
      })
    );
  }

  // Clean up judges
  for (const judge of testData.createdJudges) {
    cleanupTasks.push(
      apiRequest('DELETE', `/api/admin/judges/${judge.id}`, null, {
        'Authorization': `Bearer ${testData.adminToken}`
      })
    );
  }

  // Clean up participants
  for (const participant of testData.createdParticipants) {
    cleanupTasks.push(
      apiRequest('DELETE', `/api/participants/${participant.id}`, null, {
        'Authorization': `Bearer ${testData.adminToken}`
      })
    );
  }

  const results = await Promise.allSettled(cleanupTasks);
  let successCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    }
  });

  logSuccess(`Cleaned up ${successCount}/${cleanupTasks.length} items`);
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Comprehensive API Test Suite', 'cyan');
  log('=====================================', 'cyan');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Admin Authentication', fn: testAdminAuth },
    { name: 'Dashboard Stats', fn: testDashboardStats },
    { name: 'Participant Registration', fn: testParticipantRegistration },
    { name: 'Participant Login', fn: testParticipantLogin },
    { name: 'Get Participant Tasks', fn: testParticipantTasks },
    { name: 'Task Creation', fn: testTaskCreation },
    { name: 'Get All Tasks', fn: testGetAllTasks },
    { name: 'Judge Creation', fn: testJudgeCreation },
    { name: 'Judge Authentication', fn: testJudgeAuth },
    { name: 'Get Judge Assignments', fn: testJudgeAssignments },
    { name: 'Submission Creation', fn: testSubmissionCreation },
    { name: 'Get Submissions', fn: testGetSubmissions },
    { name: 'Update Submission Score', fn: testUpdateSubmissionScore },
    { name: 'WhatsApp Messaging', fn: testWhatsAppMessaging },
    { name: 'Get Participants List', fn: testGetParticipants },
    { name: 'Winner Creation', fn: testWinnerCreation },
    { name: 'Get Winners', fn: testGetWinners }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      } else {
        failedTests++;
      }
      await sleep(500); // Small delay between tests
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`);
      failedTests++;
    }
  }

  // Cleanup
  await cleanupTestData();

  // Results
  log('\n📊 Test Results', 'cyan');
  log('================', 'cyan');
  logSuccess(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}`);
  }
  logInfo(`Total: ${tests.length}`);

  if (failedTests === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the logs above.', 'yellow');
  }

  rl.close();
}

// Interactive menu
async function showMenu() {
  while (true) {
    log('\n🎯 Comprehensive Test Suite Menu', 'cyan');
    log('================================', 'cyan');
    log('1. Run all tests (full workflow)');
    log('2. Test only authentication');
    log('3. Test only participant flow');
    log('4. Test only admin flow');
    log('5. Test only judge flow');
    log('6. Test WhatsApp functionality');
    log('7. Clean up test data');
    log('8. Exit');

    const choice = await askQuestion('\nEnter your choice (1-8): ');

    switch (choice) {
      case '1':
        await runAllTests();
        break;
      case '2':
        await testHealthCheck();
        await testAdminAuth();
        await testParticipantLogin();
        await testJudgeAuth();
        break;
      case '3':
        await testParticipantRegistration();
        await testParticipantLogin();
        await testParticipantTasks();
        await testSubmissionCreation();
        break;
      case '4':
        await testAdminAuth();
        await testDashboardStats();
        await testTaskCreation();
        await testGetAllTasks();
        await testJudgeCreation();
        await testWinnerCreation();
        break;
      case '5':
        await testJudgeAuth();
        await testJudgeAssignments();
        await testUpdateSubmissionScore();
        break;
      case '6':
        await testAdminAuth();
        await testWhatsAppMessaging();
        await testGetParticipants();
        break;
      case '7':
        await cleanupTestData();
        break;
      case '8':
        log('Goodbye! 👋', 'cyan');
        rl.close();
        process.exit(0);
      default:
        logError('Invalid choice. Please try again.');
    }

    if (choice !== '8') {
      await askQuestion('\nPress Enter to continue...');
    }
  }
}

// Start the application
async function main() {
  log('🧪 Articon Hackathon API Test Suite', 'cyan');
  log('=====================================', 'cyan');
  log('This tool tests all API endpoints and workflows', 'blue');
  log('Make sure the server is running on http://localhost:8000', 'blue');

  const shouldRunAll = await askQuestion('\nRun all tests automatically? (y/n): ');

  if (shouldRunAll.toLowerCase() === 'y') {
    await runAllTests();
  } else {
    await showMenu();
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise} reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error}`);
  process.exit(1);
});

// Start
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testAdminAuth,
  testParticipantRegistration,
  // Export other test functions for programmatic use
};