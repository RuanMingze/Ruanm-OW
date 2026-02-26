#!/usr/bin/env node

// Lint script for Ruanm project
const { execSync } = require('child_process');

console.log('Running lint check...');

try {
  // Execute next lint from the project root
  execSync('npx next lint', {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
  console.log('Lint check completed successfully!');
} catch (error) {
  console.error('Lint check failed:', error.message);
  process.exit(1);
}
