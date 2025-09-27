#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Stop all development servers running on ports 3000-3099
 */
async function stopDevServers() {
  console.log('🛑 Stopping all development servers (ports 3000-3099)...\n');

  try {
    // Get all processes using ports in the range 3000-3099
    const { stdout } = await execAsync('netstat -ano | findstr :300');
    
    if (!stdout.trim()) {
      console.log('✅ No processes found using ports 3000-3099');
      return;
    }

    const lines = stdout.trim().split('\n');
    const pids = new Set();
    const portProcessMap = new Map();

    // Parse netstat output to extract PIDs and ports
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const localAddress = parts[1];
        const pid = parts[4];
        
        // Extract port from address (format: [::1]:3001 or 0.0.0.0:3001)
        const portMatch = localAddress.match(/:(\d{4})$/);
        if (portMatch) {
          const port = parseInt(portMatch[1]);
          // Check if port is in our target range (3000-3099)
          if (port >= 3000 && port <= 3099 && pid !== '0') {
            pids.add(pid);
            if (!portProcessMap.has(pid)) {
              portProcessMap.set(pid, []);
            }
            portProcessMap.get(pid).push(port);
          }
        }
      }
    }

    if (pids.size === 0) {
      console.log('✅ No processes found using ports 3000-3099');
      return;
    }

    console.log(`📋 Found ${pids.size} process(es) using development ports:`);
    
    // Display processes before killing
    for (const [pid, ports] of portProcessMap.entries()) {
      console.log(`   PID ${pid}: ports ${ports.join(', ')}`);
    }

    console.log('\n🔄 Terminating processes...');

    // Kill each process
    const killPromises = Array.from(pids).map(async (pid) => {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        const ports = portProcessMap.get(pid) || [];
        console.log(`✅ Killed PID ${pid} (ports: ${ports.join(', ')})`);
        return { success: true, pid, ports };
      } catch (error) {
        console.log(`❌ Failed to kill PID ${pid}: ${error.message}`);
        return { success: false, pid, error: error.message };
      }
    });

    const results = await Promise.all(killPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully killed: ${successful} process(es)`);
    if (failed > 0) {
      console.log(`   ❌ Failed to kill: ${failed} process(es)`);
    }

    // Wait a moment and verify
    console.log('\n🔍 Verifying cleanup...');
    setTimeout(async () => {
      try {
        const { stdout: verifyOutput } = await execAsync('netstat -ano | findstr :300');
        const remainingLines = verifyOutput.trim().split('\n').filter(line => {
          const portMatch = line.match(/:(\d{4})\s/);
          if (portMatch) {
            const port = parseInt(portMatch[1]);
            return port >= 3000 && port <= 3099;
          }
          return false;
        });

        if (remainingLines.length === 0) {
          console.log('✅ All development ports are now free!');
          console.log('\n🚀 You can now run "npm run dev" to start fresh servers.');
        } else {
          console.log(`⚠️  ${remainingLines.length} process(es) still using development ports`);
          console.log('💡 Some processes may require manual intervention or admin privileges');
        }
      } catch (error) {
        console.log('✅ Port cleanup appears successful (no processes found)');
        console.log('\n🚀 You can now run "npm run dev" to start fresh servers.');
      }
    }, 1000);

  } catch (error) {
    if (error.message.includes('Command failed')) {
      console.log('✅ No processes found using ports 3000-3099');
    } else {
      console.error('❌ Error checking for processes:', error.message);
    }
  }
}

// Handle script termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Script interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Script terminated');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  stopDevServers().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { stopDevServers };
