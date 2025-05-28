#!/usr/bin/env node

/**
 * Test script to verify single source of truth functionality
 * This script tests that changes to API definitions automatically propagate
 * through the entire generation chain without manual updates.
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🧪 Testing Single Source of Truth System');
console.log('=' * 50);

function checkFileContains(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const found = content.includes(searchText);
    console.log(`${found ? '✅' : '❌'} ${description}: ${found ? 'FOUND' : 'NOT FOUND'}`);
    return found;
  } catch (error) {
    console.log(`❌ ${description}: FILE NOT FOUND (${error.message})`);
    return false;
  }
}

function runStep(description, command) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Test 1: Check that our new restart action exists in the source
console.log('\n📋 Step 1: Verify restart action in source API definition');
const sourceHasRestart = checkFileContains(
  'src/api/system/registerSystemApi.ts',
  'id: "restart"',
  'Restart action in source API'
);

if (!sourceHasRestart) {
  console.log('❌ Test failed: restart action not found in source. The test assumes the restart action was added.');
  process.exit(1);
}

// Test 2: Generate OpenAPI spec
console.log('\n📋 Step 2: Generate OpenAPI specification');
const openApiGenerated = runStep('OpenAPI generation', 'npm run build:openapi');

if (!openApiGenerated) {
  console.log('❌ Test failed: Could not generate OpenAPI spec');
  process.exit(1);
}

// Test 3: Check OpenAPI spec contains restart action
console.log('\n📋 Step 3: Verify restart action in OpenAPI spec');
const openApiHasRestart = checkFileContains(
  'openapi.json',
  '/api/services/restart',
  'Restart endpoint in OpenAPI spec'
);

// Test 4: Generate client wrappers
console.log('\n📋 Step 4: Generate client wrappers');
const wrappersGenerated = runStep('Client wrapper generation', 'node scripts/generate-unified-client.js');

if (!wrappersGenerated) {
  console.log('❌ Test failed: Could not generate client wrappers');
  process.exit(1);
}

// Test 5: Check TypeScript wrapper contains restart method
console.log('\n📋 Step 5: Verify restart method in TypeScript wrapper');
const tsHasRestart = checkFileContains(
  'src/prometheos-client/index.ts',
  'async restart(params',
  'Restart method in TypeScript client'
);

// Test 6: Check Python wrapper contains restart method  
console.log('\n📋 Step 6: Verify restart method in Python wrapper');
const pythonHasRestart = checkFileContains(
  'src/prometheos-client-python/prometheos_client.py',
  'async def restart(',
  'Restart method in Python client'
);

// Test 7: Check test plugin can use the new method
console.log('\n📋 Step 7: Verify test plugin uses restart method');
const testPluginHasRestart = checkFileContains(
  'src/plugins/apps/prometheos-test/ui.tsx',
  'services.restart',
  'Restart method usage in test plugin'
);

// Summary
console.log('\n🎯 Single Source of Truth Test Results');
console.log('=' * 50);

const allTests = [
  { name: 'Source API has restart action', passed: sourceHasRestart },
  { name: 'OpenAPI spec generated', passed: openApiGenerated },
  { name: 'OpenAPI spec has restart endpoint', passed: openApiHasRestart },
  { name: 'Client wrappers generated', passed: wrappersGenerated },
  { name: 'TypeScript wrapper has restart method', passed: tsHasRestart },
  { name: 'Python wrapper has restart method', passed: pythonHasRestart },
  { name: 'Test plugin uses restart method', passed: testPluginHasRestart }
];

const passedTests = allTests.filter(test => test.passed).length;
const totalTests = allTests.length;

allTests.forEach(test => {
  console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('\n🎉 SUCCESS: Single source of truth system is working correctly!');
  console.log('✨ Changes to the API definition automatically propagate through:');
  console.log('   1. Source API definition (registerSystemApi.ts)');
  console.log('   2. OpenAPI specification (openapi.json)');
  console.log('   3. Generated TypeScript client wrapper');
  console.log('   4. Generated Python client wrapper');
  console.log('   5. Application code using the wrappers');
  console.log('\n🔄 The system truly has a single source of truth!');
  process.exit(0);
} else {
  console.log('\n❌ FAILURE: Single source of truth system has issues');
  console.log('🔧 Some steps in the generation chain may need fixing');
  process.exit(1);
}
