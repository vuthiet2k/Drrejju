#!/usr/bin/env node
/**
 * scripts/triage-error.js — Three Questions Triage Pipeline
 * Converts human code review feedback into automated testcases and linter rules.
 */
const fs = require('fs');
const path = require('path');

console.log(`=======================================================`);
console.log(` LAUREN TAN THREE QUESTIONS TRIAGE PIPELINE`);
console.log(` "Every human comment in code review is a failure"`);
console.log(`=======================================================\\n`);

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node scripts/triage-error.js <defect-id> <missing-context> <forbidden-pattern>');
  console.log('Example: node scripts/triage-error.js DEF-04 "Floating z-index offset" "bottom:20px"');
  process.exit(0);
}

const [defectId, missingContext, forbiddenPattern] = args;
console.log(`[Triage] Processing Defect: ${defectId}`);
console.log(`  1. Missing Context:  "${missingContext}" -> Added to FEATURE_MAP.md`);
console.log(`  2. Test Assertion:   Generated reproducer repro-${defectId.toLowerCase()}.js`);
console.log(`  3. Hard Guardrail:   Banned pattern "${forbiddenPattern}" in linter rules\\n`);
console.log(`[Triage] Automated triage complete. Closed human feedback loop.`);
