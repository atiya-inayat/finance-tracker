import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: "v1",
});

export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // ✅ Correct free model
    });

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({
      success: true,
      response: reply,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      message: "AI request failed",
      error: error.message,
    });
  }
};
