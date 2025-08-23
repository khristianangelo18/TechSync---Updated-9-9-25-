// backend/utils/codeEvaluator.js
// FIXED VERSION with Database Integration and Proper Error Handling

const axios = require('axios');
const { resolveLanguageId } = require('./judge0Languages');

// Judge0 API Configuration
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY || process.env.RAPIDAPI_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

// Default headers for Judge0 API
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (JUDGE0_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_KEY;
    headers['X-RapidAPI-Host'] = JUDGE0_HOST;
  }
  
  return headers;
};

/**
 * FIXED: Safely convert value to string for Buffer encoding
 */
function safeStringify(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * FIXED: Submit code execution to Judge0
 */
async function submitExecution({
  sourceCode,
  languageId,
  stdin = '',
  expectedOutput = '',
  timeLimitMs = 5000,
  memoryLimitMb = 256
}) {
  try {
    // FIXED: Ensure all values are strings before encoding
    const sourceCodeStr = safeStringify(sourceCode);
    const stdinStr = safeStringify(stdin);
    const expectedOutputStr = safeStringify(expectedOutput);

    const payload = {
      source_code: Buffer.from(sourceCodeStr).toString('base64'),
      language_id: languageId,
      stdin: stdinStr ? Buffer.from(stdinStr).toString('base64') : null,
      expected_output: expectedOutputStr ? Buffer.from(expectedOutputStr).toString('base64') : null,
      cpu_time_limit: Math.ceil(timeLimitMs / 1000), // Convert to seconds
      memory_limit: memoryLimitMb * 1024, // Convert to KB
    };

    console.log(`[Judge0] Submitting execution for language ${languageId}`);

    const response = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
      payload,
      {
        headers: getHeaders(),
        timeout: 15000 // Increased timeout
      }
    );

    if (!response.data.token) {
      throw new Error('No submission token received from Judge0');
    }

    return response.data.token;
  } catch (error) {
    console.error('[Judge0] Submission failed:', error.message);
    if (error.response) {
      console.error('[Judge0] Response error:', error.response.data);
    }
    throw new Error(`Judge0 submission failed: ${error.message}`);
  }
}

/**
 * Get execution result from Judge0
 */
async function getExecutionResult(token) {
  try {
    const maxAttempts = 30; // 30 attempts = ~30 seconds max wait
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
        {
          headers: getHeaders(),
          timeout: 10000
        }
      );

      const result = response.data;
      
      // Status IDs: 1=queued, 2=processing, 3=accepted, 4=wrong answer, 5=time limit, 6=compilation error, etc.
      if (result.status.id <= 2) {
        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        continue;
      }

      // Execution completed, decode base64 results
      return {
        status: result.status,
        stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '',
        stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '',
        compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : '',
        time: parseFloat(result.time) || 0,
        memory: parseInt(result.memory) || 0,
        exit_code: result.exit_code
      };
    }

    throw new Error('Execution timeout - Judge0 took too long to respond');
  } catch (error) {
    console.error('[Judge0] Get result failed:', error.message);
    throw new Error(`Failed to get Judge0 result: ${error.message}`);
  }
}

/**
 * FIXED: Execute a single test case with better error handling
 */
async function executeTestCase({
  sourceCode,
  languageId,
  testCase,
  timeLimitMs = 5000,
  memoryLimitMb = 256
}) {
  try {
    const startTime = Date.now();
    
    // FIXED: Extract input and expected output safely
    const input = safeStringify(testCase.input || testCase.stdin || '');
    const expectedOutput = safeStringify(
      testCase.expected_output || 
      testCase.output || 
      testCase.expectedOutput || 
      testCase.expected ||
      ''
    );

    console.log(`[Judge0] Test case - Input: "${input}", Expected: "${expectedOutput}"`);
    
    // Submit execution
    const token = await submitExecution({
      sourceCode,
      languageId,
      stdin: input,
      expectedOutput: expectedOutput,
      timeLimitMs,
      memoryLimitMb
    });

    // Get result
    const result = await getExecutionResult(token);
    const endTime = Date.now();

    const actualOutput = result.stdout.trim();
    const expectedOutputTrimmed = expectedOutput.trim();
    const passed = actualOutput === expectedOutputTrimmed;

    const testResult = {
      passed,
      input,
      expectedOutput: expectedOutputTrimmed,
      actualOutput,
      executionTime: result.time * 1000, // Convert to ms
      memoryUsage: result.memory, // In KB
      status: result.status,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      wallTime: endTime - startTime,
      exitCode: result.exit_code
    };

    // Log result for debugging
    console.log(`[Judge0] Test result: ${passed ? 'PASSED' : 'FAILED'}`);
    if (!passed) {
      console.log(`[Judge0] Expected: "${expectedOutputTrimmed}"`);
      console.log(`[Judge0] Actual: "${actualOutput}"`);
      if (result.stderr) {
        console.log(`[Judge0] Stderr: ${result.stderr}`);
      }
      if (result.compile_output) {
        console.log(`[Judge0] Compile: ${result.compile_output}`);
      }
    }

    return testResult;
  } catch (error) {
    console.error('[Judge0] Test execution error:', error.message);
    return {
      passed: false,
      input: safeStringify(testCase.input || testCase.stdin || ''),
      expectedOutput: safeStringify(testCase.expected_output || testCase.output || ''),
      actualOutput: '',
      executionTime: 0,
      memoryUsage: 0,
      status: { id: -1, description: 'Execution Error' },
      stderr: error.message,
      compileOutput: '',
      wallTime: 0,
      exitCode: -1,
      error: error.message
    };
  }
}

/**
 * ENHANCED: Parse test cases from database format
 */
function parseTestCases(testCasesData) {
  try {
    let testCases = testCasesData;

    // Handle string JSON
    if (typeof testCasesData === 'string') {
      try {
        testCases = JSON.parse(testCasesData);
      } catch (parseError) {
        console.error('[Judge0] Failed to parse test cases JSON:', parseError.message);
        return [];
      }
    }

    // Handle different formats
    if (Array.isArray(testCases)) {
      return testCases;
    }

    if (testCases && Array.isArray(testCases.tests)) {
      return testCases.tests;
    }

    if (testCases && typeof testCases === 'object') {
      // Single test case
      return [testCases];
    }

    console.log('[Judge0] Unknown test case format:', typeof testCasesData);
    return [];
  } catch (error) {
    console.error('[Judge0] Error parsing test cases:', error.message);
    return [];
  }
}

/**
 * NEW: Get expected solution from database if available
 */
async function getExpectedSolution(challengeId) {
  try {
    if (!challengeId) return null;
    
    const supabase = require('../config/supabase');
    const { data: challenge, error } = await supabase
      .from('coding_challenges')
      .select('expected_solution, test_cases')
      .eq('id', challengeId)
      .single();

    if (error || !challenge) {
      console.log('[Judge0] Could not fetch expected solution from database');
      return null;
    }

    return {
      expectedSolution: challenge.expected_solution,
      testCases: parseTestCases(challenge.test_cases)
    };
  } catch (error) {
    console.error('[Judge0] Database error getting expected solution:', error.message);
    return null;
  }
}

/**
 * ENHANCED: Main function to run all tests for a code submission
 */
async function runTests({
  sourceCode,
  languageName,
  testCases,
  challengeId = null,
  timeLimitMs = 5000,
  memoryLimitMb = 256
}) {
  try {
    console.log(`[Judge0] Running tests for ${languageName}`);

    // Resolve language name to Judge0 language ID
    const languageId = await resolveLanguageId(languageName);
    if (!languageId) {
      throw new Error(`Unsupported language: ${languageName}`);
    }

    console.log(`[Judge0] Language ${languageName} mapped to ID ${languageId}`);

    // ENHANCED: Try to get test cases from database if challengeId provided
    let finalTestCases = parseTestCases(testCases);
    
    if (challengeId && (!finalTestCases || finalTestCases.length === 0)) {
      console.log(`[Judge0] Fetching test cases from database for challenge ${challengeId}`);
      const dbData = await getExpectedSolution(challengeId);
      if (dbData && dbData.testCases && dbData.testCases.length > 0) {
        finalTestCases = dbData.testCases;
        console.log(`[Judge0] Using ${finalTestCases.length} test cases from database`);
      }
    }

    if (!finalTestCases || finalTestCases.length === 0) {
      throw new Error('No test cases available for this challenge');
    }

    console.log(`[Judge0] Running ${finalTestCases.length} test case(s)`);

    // Execute all test cases
    const testResults = [];
    let totalExecutionTime = 0;
    let peakMemoryUsage = 0;
    let passedCount = 0;

    for (let i = 0; i < finalTestCases.length; i++) {
      const testCase = finalTestCases[i];
      console.log(`[Judge0] Executing test case ${i + 1}/${finalTestCases.length}`);

      const result = await executeTestCase({
        sourceCode,
        languageId,
        testCase,
        timeLimitMs,
        memoryLimitMb
      });

      testResults.push({
        testNumber: i + 1,
        ...result
      });

      totalExecutionTime += result.executionTime;
      peakMemoryUsage = Math.max(peakMemoryUsage, result.memoryUsage);

      if (result.passed) {
        passedCount++;
      }

      // Log test result
      console.log(`[Judge0] Test ${i + 1}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.executionTime.toFixed(2)}ms)`);
    }

    const finalResults = {
      passedCount,
      totalCount: finalTestCases.length,
      totalTimeMs: totalExecutionTime,
      peakMemoryKb: peakMemoryUsage,
      tests: testResults,
      language: languageName,
      languageId,
      allPassed: passedCount === finalTestCases.length,
      challengeId
    };

    console.log(`[Judge0] Completed: ${passedCount}/${finalTestCases.length} tests passed`);
    return finalResults;

  } catch (error) {
    console.error('[Judge0] runTests error:', error.message);
    throw error;
  }
}

/**
 * Quick test to verify Judge0 connectivity
 */
async function testJudge0Connection() {
  try {
    console.log('[Judge0] Testing connection...');
    
    const response = await axios.get(`${JUDGE0_URL}/languages`, {
      headers: getHeaders(),
      timeout: 10000
    });

    console.log(`[Judge0] Connected successfully. ${response.data.length} languages available.`);
    return { success: true, languageCount: response.data.length };
  } catch (error) {
    console.error('[Judge0] Connection test failed:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  runTests,
  executeTestCase,
  submitExecution,
  getExecutionResult,
  testJudge0Connection,
  parseTestCases,
  getExpectedSolution
};