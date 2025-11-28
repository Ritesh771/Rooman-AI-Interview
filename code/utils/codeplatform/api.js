// Simulated code execution API
// In a real implementation, this would connect to a secure code execution service

export const executeCode = async (language, sourceCode, stdin = "") => {
  const response = await fetch("/api/code-execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      code: sourceCode,
      input: stdin,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error || "Unable to execute code")
  }

  return response.json()
}