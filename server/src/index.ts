import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface QuizRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

app.post('/generate-quiz', async (req, res) => {
  const { topic, difficulty } = req.body as QuizRequest;

  const prompt = `
  Create a ${difficulty} level quiz about "${topic}" with 5 multiple-choice questions.
  Each question should have 4 options, specify the correct one, and include an explanation.
  Return as JSON: [{question, options, answer, explanation}]
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const content = response.choices[0].message?.content;
    const quiz: QuizQuestion[] = JSON.parse(content || '');
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
