// Test script to verify all Module Federation services are running
const http = require('http');

const services = [
  { name: 'Desktop Host', url: 'http://localhost:3011', path: '/' },
  { name: 'Notepad Remote', url: 'http://localhost:3001', path: '/remoteEntry.js' },
  { name: 'Shared UI Kit', url: 'http://localhost:3003', path: '/remoteEntry.js' }
];

function testService(service) {
  return new Promise((resolve) => {
    const url = new URL(service.path, service.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        name: service.name,
        url: service.url,
        status: res.statusCode,
        success: res.statusCode < 400
      });
    });

    req.on('error', (err) => {
      resolve({
        name: service.name,
        url: service.url,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        url: service.url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function testAllServices() {
  console.log('🧪 Testing Module Federation Services...\n');
  
  const results = await Promise.all(services.map(testService));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const statusText = result.success ? `HTTP ${result.status}` : `${result.status} - ${result.error}`;
    console.log(`${status} ${result.name}: ${result.url} - ${statusText}`);
  });
  
  const allSuccess = results.every(r => r.success);
  console.log(`\n${allSuccess ? '🎉' : '⚠️'} Overall Status: ${allSuccess ? 'All services are running!' : 'Some services have issues'}`);
  
  if (allSuccess) {
    console.log('\n🚀 Ready for development! Open http://localhost:3011 in your browser.');
  } else {
    console.log('\n💡 Run "npm run dev" to start all services.');
  }
}

testAllServices().catch(console.error);
