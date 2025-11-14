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

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-small",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: "summarize: " + userMessage
        })
      }
    );

    const data = await response.json();

    // ✅ اصلاح شده: پاسخ مدل یک آرایه است
    const summary = data?.[0]?.generated_text || "خلاصه نشد";

    res.json({
      choices: [{ message: { content: summary } }]
    });
  } catch (error) {
    console.error("Hugging Face Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
