export const analyzeProblem = async (problem) => {
  const response = await fetch(
    "http://localhost:8000/api/v1/problem/analyze",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ problem }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to analyze problem.");
  }

  return data.analysis;
};