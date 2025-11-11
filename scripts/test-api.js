// ============================================
// BearishBully Edge - JavaScript API Test Client
// Test the volume API from Node.js
// ============================================

const sampleData = require('./sampleData.json');

/**
 * Test the volume API endpoint
 */
async function testVolumeApi(apiUrl = 'http://localhost:3000/api/volume') {
  console.log('==========================================');
  console.log('BearishBully Edge - Volume API Test (JS)');
  console.log('==========================================\n');
  console.log('Testing endpoint:', apiUrl);
  console.log('Sample data:', JSON.stringify(sampleData, null, 2), '\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleData),
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2), '\n');

    if (response.ok) {
      console.log('✓ Test PASSED - Data inserted successfully');
      console.log(`  Inserted ${data.inserted} bars`);
      return { success: true, data };
    } else {
      console.error('✗ Test FAILED - API returned error');
      console.error('  Errors:', data.errors);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('✗ Test FAILED - Network or server error');
    console.error('  Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate live test data with current timestamps
 */
function generateLiveTestData(count = 5) {
  const bars = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const barTime = new Date(now.getTime() - (count - i) * 60000); // Go back in minutes
    const openVolume = Math.floor(Math.random() * 5000) + 12000;
    const closeVolume = Math.floor(Math.random() * 5000) + 12000;

    bars.push({
      symbol: 'MNQ',
      related_symbol: 'QQQ',
      bar_time: barTime.toISOString(),
      open_volume: openVolume,
      close_volume: closeVolume,
      delta_volume: openVolume - closeVolume,
      timeframe: '1m',
      source: 'NinjaTrader',
    });
  }

  return { bars };
}

/**
 * Test with live data
 */
async function testWithLiveData(apiUrl = 'http://localhost:3000/api/volume') {
  console.log('\n==========================================');
  console.log('Testing with LIVE timestamp data...');
  console.log('==========================================\n');

  const liveData = generateLiveTestData(5);
  console.log('Generated live data:', JSON.stringify(liveData, null, 2), '\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(liveData),
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2), '\n');

    if (response.ok) {
      console.log('✓ Live data test PASSED');
      return { success: true, data };
    } else {
      console.error('✗ Live data test FAILED');
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('✗ Live data test FAILED - Network error');
    console.error('  Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run tests if called directly
if (require.main === module) {
  const apiUrl = process.env.API_URL || 'http://localhost:3000/api/volume';

  (async () => {
    // Test 1: Sample data from file
    const result1 = await testVolumeApi(apiUrl);

    // Test 2: Live generated data
    const result2 = await testWithLiveData(apiUrl);

    // Summary
    console.log('\n==========================================');
    console.log('Test Summary');
    console.log('==========================================');
    console.log('Sample data test:', result1.success ? '✓ PASSED' : '✗ FAILED');
    console.log('Live data test:', result2.success ? '✓ PASSED' : '✗ FAILED');

    process.exit(result1.success && result2.success ? 0 : 1);
  })();
}

module.exports = {
  testVolumeApi,
  testWithLiveData,
  generateLiveTestData,
};
