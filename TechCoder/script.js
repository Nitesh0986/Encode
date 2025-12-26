// script.js

async function analyzeIngredients() {
  const ingredientsInput = document.getElementById("ingredients");
  const output = document.getElementById("output");

  const ingredients = ingredientsInput.value;

  if (!ingredients.trim()) {
    output.innerText = "Please enter an ingredient list.";
    return;
  }

  output.innerText = "Thinking...";

  // WARNING: never expose real API keys in production front-end code.
  const API_KEY = "AIzaSyAk9TfEEGTKqWZGnIclKxI1G5VSSNBSMG4"; // <-- replace with your key

  const prompt = `
You are an AI-native consumer health co-pilot.

Do NOT list or explain every ingredient.
Do NOT give medical advice.

Infer what matters for a quick buy-or-eat decision.
Explain implications in simple, human language.
Communicate trade-offs and uncertainty honestly.

Ingredients:
${ingredients}
`;

  // Use a currently supported Gemini model endpoint
  const endpoint =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" +
    API_KEY;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    // Handle HTTP errors first
    if (!response.ok) {
      let errorBody = {};
      try {
        errorBody = await response.json();
      } catch (e) {
        // ignore parse failure
      }
      console.error("API error:", response.status, response.statusText, errorBody);
      output.innerText = "API error: " + response.status + ". Check console.";
      return;
    }

    const data = await response.json();
    console.log("Gemini response:", data);

    // Defensive checks before accessing [0]
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in response:", data);
      output.innerText = "No AI response received. Try again.";
      return;
    }

    if (
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      data.candidates[0].content.parts.length === 0
    ) {
      console.error("No content parts in first candidate:", data);
      output.innerText = "Response format unexpected. Check console.";
      return;
    }

    const aiText = data.candidates[0].content.parts[0].text || "";
    output.innerText = aiText.trim()
      ? aiText
      : "Got an empty response from the model.";
  } catch (error) {
    console.error("Request failed:", error);
    output.innerText = "Something went wrong. Check console.";
  }
}
