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
    const userMessage = messages[messages.length - 1]?.content;

    if (!userMessage) {
      return res.json({
        choices: [{ message: { content: "هیچ متنی برای خلاصه وجود ندارد." } }]
      });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: "summarize: " + userMessage })
      }
    );

    const data = await response.json();
    console.log("Hugging Face raw response:", data);

    let summary = "خلاصه نشد";

    if (Array.isArray(data) && data[0]?.generated_text) {
      summary = data[0].generated_text;
    } else if (data?.error) {
      summary = "خطای مدل: " + data.error;
    }

    res.json({
      choices: [{ message: { content: summary } }]
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ choices: [{ message: { content: "خطای سرور" } }] });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
