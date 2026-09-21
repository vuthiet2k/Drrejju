/**
 * tests/agent-harness/capture.js — Trace & Error Collector
 */
const fs = require('fs');
const path = require('path');

class TestCapture {
  constructor(taskId) {
    this.taskId = taskId;
    this.consoleErrors = [];
    this.failedRequests = [];
    this.assertions = [];
  }

  attachToPage(page) {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', req => {
      this.failedRequests.push(`${req.method()} ${req.url()} — ${req.failure() ? req.failure().errorText : 'failed'}`);
    });

    page.on('pageerror', err => {
      this.consoleErrors.push(`[UncaughtPageError] ${err.message}`);
    });
  }

  assert(condition, checkName, details = {}) {
    const passed = !!condition;
    this.assertions.push({
      name: checkName,
      status: passed ? 'PASS' : 'FAIL',
      ...details
    });
    return passed;
  }

  exportReport() {
    const allPassed = this.assertions.every(a => a.status === 'PASS') && this.consoleErrors.length === 0;
    return {
      taskId: this.taskId,
      overallStatus: allPassed ? 'PASS' : 'FAIL',
      assertionsCount: this.assertions.length,
      passedCount: this.assertions.filter(a => a.status === 'PASS').length,
      failedCount: this.assertions.filter(a => a.status === 'FAIL').length,
      consoleErrorsCount: this.consoleErrors.length,
      consoleErrors: this.consoleErrors,
      failedRequests: this.failedRequests,
      assertions: this.assertions,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TestCapture;
