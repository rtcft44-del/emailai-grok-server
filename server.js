import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error("HF_TOKEN is not provided in environment variables.");
  process.exit(1);
}

app.post("/api/grok", async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages array" });
    }
    const userMessage = messages[messages.length - 1].content;
    if (!userMessage) {
      return res.status(400).json({ error: "No content in the last message" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: userMessage })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
      return…
```js
      return res.status(500).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log("Raw response from Hugging Face:", data); // Debug

    // این خط درست شد!
    const summary = data[0]?.summary_text || "خلاصه در دسترس نیست";

    res.json({ choices: [{ message: { content: summary } }] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
