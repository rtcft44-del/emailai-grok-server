import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;

app.post("/api/grok", async (req, res) => {
  try {
    const { messages } = req.body;
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
        body: JSON.stringify({
          inputs: userMessage,
          parameters: {
            max_length: 100,
            min_length: 30
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
      return res.status(500).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log("Raw response from Hugging Face:", data); // Debug: Log the raw response

    // این خط درست شد – bart-large-cnn همیشه data[0].summary_text داره
    const summary = data[0]?.summary_text || "خلاصه در دسترس نیست";

    res.json({ choices: [{ message: { content: summary } }] });
  } catch (error) {
    console.error("Hugging Face Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
