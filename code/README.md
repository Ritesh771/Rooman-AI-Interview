# Coding Interview Platform

This directory contains the components for the coding interview platform, which allows candidates to participate in technical coding interviews with real-time code execution and evaluation.

## Features

- Real-time code editor with syntax highlighting (using Monaco Editor)
- Support for multiple programming languages (JavaScript, Python, Java, C++)
- Code execution and output display
- Interview timer with automatic completion
- Multiple coding challenges with sample and hidden test cases
- Question navigation
- Score evaluation and feedback

## Components

### CodeEditor.jsx
The main code editor component that provides:
- Monaco Editor integration
- Language selection
- Code saving functionality
- Run and Submit buttons

### CodingInterview.jsx
The main interview interface that provides:
- Interview timer
- Question navigation
- Challenge display with description, input/output format, and constraints
- Integration with CodeEditor
- Test case execution and results display
- Score calculation

### LanguageSelector.jsx
Dropdown component for selecting programming languages.

### Output.jsx
Component for displaying code execution output.

### TestCodingInterview.jsx
Demo component for testing the coding interview functionality.

## API

### Code Execution API
Located at `code/utils/codeplatform/api.js`, this module provides:
- `executeCode(language, sourceCode, stdin?)` - Simulates code execution with optional custom input

### Sample Data
Located at `code/utils/codeplatform/sampleData.js`, this module provides:
- Sample coding interview data for testing

## Usage

### Starting a Coding Interview
1. Navigate to `/test/coding-interview` to see a demo
2. Click "Start Sample Interview" to begin
3. Use the code editor to write solutions
4. Click "Run Code" to test against sample cases
5. Click "Submit" to evaluate your solution
6. Navigate between questions using the question navigation panel

### Creating a New Interview
To create a new coding interview:
1. Use the API endpoint at `/api/coding-interview/generate` with the required parameters:
   - `role`: Job role (e.g., "Frontend Developer")
   - `experienceLevel`: Experience level (e.g., "0-1 years", "2-5 years")
   - `difficulty`: Difficulty level ("Easy", "Medium", "Hard")
   - `numberOfQuestions`: Number of coding challenges
   - `title`: Interview title (optional)

2. The API will return a structured interview object with coding challenges

### Integrating with Existing System
To integrate with the existing interview system:
1. Create a new route at `/interview/[id]/coding` that loads the coding interview
2. Fetch interview data from the existing API
3. Pass the data to the `CodingInterview` component
4. Handle completion with the `onComplete` callback

## Supported Languages

- JavaScript
- Python
- Java
- C++

## Future Improvements

- Integration with a secure code execution sandbox
- Real test case evaluation instead of simulation
- Collaborative coding features
- More programming languages
- Detailed performance analytics
- Interview recording and playback