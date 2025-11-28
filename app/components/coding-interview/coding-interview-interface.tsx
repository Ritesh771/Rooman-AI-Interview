  // Run code against sample test cases
  const runCode = async () => {
    setIsRunning(true);
    
    try {
      // Execute the code with the first sample test case input
      const testCase = currentChallenge.sampleTestCases[0];
      
      const response = await fetch("/api/code-execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
          input: testCase.input
        }),
      });
      
      const result = await response.json();
      
      // For demo purposes, we'll just show the execution result
      const results = [{
        testCaseIndex: 0,
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.run.stdout || result.run.output,
        passed: !result.run.stderr
      }];
      
      setTestResults(results);
    } catch (error) {
      console.error("Error executing code:", error);
      setTestResults([{
        testCaseIndex: 0,
        input: currentChallenge.sampleTestCases[0].input,
        expectedOutput: currentChallenge.sampleTestCases[0].output,
        actualOutput: "Error occurred during execution",
        passed: false
      }]);
    } finally {
      setIsRunning(false);
    }
  };