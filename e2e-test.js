/**
 * E2E Test Script for DigBahi Staging Environment
 * 
 * Tests offline-first behavior, sync queue processing, and conflict resolution
 */

const BASE_URL = process.env.STAGING_URL || 'http://localhost:8001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

const testResults = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  frontendUrl: FRONTEND_URL,
  tests: [],
  summary: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 0
    };
  }
}

async function runTest(name, testFn) {
  console.log(`\n🧪 Running test: ${name}`);
  
  try {
    const result = await testFn();
    
    testResults.tests.push({
      name,
      passed: result.passed,
      duration: result.duration,
      details: result.details,
      error: result.error
    });
    
    if (result.passed) {
      testResults.summary.passed++;
      console.log(`✅ ${name}: PASSED`);
    } else {
      testResults.summary.failed++;
      console.log(`❌ ${name}: FAILED - ${result.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    testResults.tests.push({
      name,
      passed: false,
      error: error.message
    });
    testResults.summary.failed++;
    console.log(`❌ ${name}: ERROR - ${error.message}`);
  }
  
  testResults.summary.total++;
}

// Test 1: Health Check
async function testHealthCheck() {
  const start = Date.now();
  const result = await makeRequest('/api/v1/health');
  
  return {
    passed: result.success && result.status === 200,
    duration: Date.now() - start,
    details: {
      status: result.status,
      data: result.data
    },
    error: result.success ? null : `HTTP ${result.status}: ${result.error || 'Request failed'}`
  };
}

// Test 2: Ledger GET
async function testLedgerGet() {
  const start = Date.now();
  const result = await makeRequest('/api/v1/ledger');
  
  return {
    passed: result.success && result.status === 200,
    duration: Date.now() - start,
    details: {
      status: result.status,
      entryCount: Array.isArray(result.data) ? result.data.length : 0,
      data: result.data
    },
    error: result.success ? null : `HTTP ${result.status}: ${result.error || 'Request failed'}`
  };
}

// Test 3: Ledger POST (Create Entry)
async function testLedgerPost() {
  const start = Date.now();
  const testEntry = {
    date: new Date().toISOString().split('T')[0],
    description: 'E2E Test Entry',
    amount: 1000.00,
    type: 'sale',
    gstRate: 18.0,
    gstAmount: 180.0
  };
  
  const result = await makeRequest('/api/v1/ledger', 'POST', testEntry);
  
  return {
    passed: result.success && result.status === 200,
    duration: Date.now() - start,
    details: {
      status: result.status,
      createdEntry: result.data,
      testEntry
    },
    error: result.success ? null : `HTTP ${result.status}: ${result.error || 'Request failed'}`
  };
}

// Test 4: Sync Endpoint
async function testSyncEndpoint() {
  const start = Date.now();
  const syncData = {
    entries: [
      {
        id: `test_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: 'Sync Test Entry',
        amount: 500.00,
        type: 'expense',
        gstRate: 5.0,
        gstAmount: 25.0,
        deviceId: 'device_a'
      }
    ],
    deviceId: 'device_a',
    timestamp: Date.now()
  };
  
  const result = await makeRequest('/api/v1/sync', 'POST', syncData);
  
  return {
    passed: result.success && result.status === 200,
    duration: Date.now() - start,
    details: {
      status: result.status,
      syncResponse: result.data,
      syncData
    },
    error: result.success ? null : `HTTP ${result.status}: ${result.error || 'Request failed'}`
  };
}

// Test 5: Conflict Resolution Simulation
async function testConflictResolution() {
  const start = Date.now();
  
  // Create two entries with same party but different amounts (simulating conflict)
  const entry1 = {
    date: new Date().toISOString().split('T')[0],
    description: 'Same Party Entry A',
    amount: 1000.00,
    type: 'sale',
    gstRate: 18.0,
    gstAmount: 180.0,
    party: 'Test Customer',
    deviceId: 'device_a'
  };
  
  const entry2 = {
    date: new Date().toISOString().split('T')[0],
    description: 'Same Party Entry B',
    amount: 1500.00, // Different amount - potential conflict
    type: 'sale',
    gstRate: 18.0,
    gstAmount: 270.0,
    party: 'Test Customer',
    deviceId: 'device_b'
  };
  
  // Post both entries
  const result1 = await makeRequest('/api/v1/ledger', 'POST', entry1);
  const result2 = await makeRequest('/api/v1/ledger', 'POST', entry2);
  
  // Check if both were accepted (conflict resolution working)
  const bothAccepted = result1.success && result2.success;
  
  return {
    passed: bothAccepted,
    duration: Date.now() - start,
    details: {
      entry1: {
        success: result1.success,
        status: result1.status,
        data: result1.data
      },
      entry2: {
        success: result2.success,
        status: result2.status,
        data: result2.data
      },
      conflictResolved: bothAccepted
    },
    error: bothAccepted ? null : `Conflict resolution failed: Entry1(${result1.status}), Entry2(${result2.status})`
  };
}

// Test 6: Reports Endpoint
async function testReportsEndpoint() {
  const start = Date.now();
  const result = await makeRequest('/api/v1/reports');
  
  return {
    passed: result.success && result.status === 200,
    duration: Date.now() - start,
    details: {
      status: result.status,
      reportData: result.data
    },
    error: result.success ? null : `HTTP ${result.status}: ${result.error || 'Request failed'}`
  };
}

// Main test runner
async function runE2ETests() {
  console.log('🚀 Starting DigBahi E2E Tests');
  console.log(`📡 Backend URL: ${BASE_URL}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log('=' .repeat(80));
  
  await runTest('Health Check', testHealthCheck);
  await runTest('Ledger GET', testLedgerGet);
  await runTest('Ledger POST', testLedgerPost);
  await runTest('Sync Endpoint', testSyncEndpoint);
  await runTest('Conflict Resolution', testConflictResolution);
  await runTest('Reports Endpoint', testReportsEndpoint);
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 E2E TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed}`);
  console.log(`Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  // Save results to file
  const fs = await import('fs');
  const filename = `e2e-test-results-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(testResults, null, 2));
  console.log(`\n📁 Results saved to: ${filename}`);
  
  return testResults;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runE2ETests()
    .then((results) => {
      const exitCode = results.summary.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ E2E Test Suite Failed:', error);
      process.exit(1);
    });
}

export { runE2ETests, testResults };
