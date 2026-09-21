#!/usr/bin/env node
/**
 * tests/agent-harness/runner.js — Automated CLI Verification Runner for AI Agents
 * Usage: node tests/agent-harness/runner.js <TASK-OR-DEF-ID>
 */
const path = require('path');
const fs = require('fs');
const { startDevServer } = require('./harness');
const TestCapture = require('./capture');

const targetId = (process.argv[2] || 'ALL').toUpperCase();

async function run() {
  console.log(`=======================================================`);
  console.log(` DR.REJU AGENT VERIFICATION RUNNER — TARGET: ${targetId}`);
  console.log(`=======================================================\\n`);

  let server;
  try {
    server = await startDevServer(3080);
    const reproFile = path.join(__dirname, '..', 'reproducers', `repro-${targetId.toLowerCase()}.js`);
    
    if (fs.existsSync(reproFile)) {
      console.log(`[Runner] Executing reproducer: ${path.basename(reproFile)}`);
      const testFn = require(reproFile);
      const result = await testFn(server.url);
      console.log(`\\n[Result] Verification for ${targetId}: ${result.overallStatus}`);
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.overallStatus === 'PASS' ? 0 : 1);
    } else {
      console.log(`[Runner] No specific reproducer for ${targetId}. Running Quality Contracts audit...`);
      const qcScript = require('./quality-contracts');
      const audit = await qcScript.runAudit(server.url);
      console.log(JSON.stringify(audit, null, 2));
      process.exit(audit.overallStatus === 'PASS' ? 0 : 1);
    }
  } catch (e) {
    console.error(`[Runner:Error] Verification crashed:`, e.message);
    process.exit(2);
  } finally {
    if (server) server.close();
  }
}

if (require.main === module) {
  run();
}
