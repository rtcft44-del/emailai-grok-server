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
    const userMessage = messages[messages.length - 1].content;

    const response = await fetch("https://router.huggingface.co/hf-inference", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "facebook/bart-large-cnn",
        inputs: userMessage,
        parameters: {
          max_length: 100,
          min_length: 30
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return res.status(500).json({ error: errorData?.error || "HF Error" });
    }

    const data = await response.json();
    const summary = data[0]?.summary_text || data.generated_text || "خلاصه در دسترس نیست";

    res.json({ choices: [{ message: { content: summary } }] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
