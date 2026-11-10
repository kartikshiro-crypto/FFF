import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client with provided key:', err);
  }
}

// Model Persona Profiles
interface ModelPersona {
  name: string;
  tagline: string;
  systemPromptModifier: string;
}

const MODEL_PROFILES: Record<string, ModelPersona> = {
  gemini: {
    name: 'Gemini 2.5 Flash',
    tagline: 'Google AI • Multimodal & Fast Reasoning',
    systemPromptModifier:
      'Adopt the persona of Google Gemini 2.5 Flash: rapid, direct, crystal-clear conceptual breakdowns, bulleted summaries, and actionable code/formula blocks.',
  },
  claude: {
    name: 'Claude 3.7 Sonnet',
    tagline: 'Anthropic • Pedagogical & Socratic Mentor',
    systemPromptModifier:
      'Adopt the persona of Anthropic Claude 3.7 Sonnet: deeply thoughtful, warm academic mentor, structured nuance, encouraging tone, and Socratic guiding questions to help the student learn deeply.',
  },
  gpt: {
    name: 'GPT-4o',
    tagline: 'OpenAI • Comprehensive Exam & Problem Solver',
    systemPromptModifier:
      'Adopt the persona of OpenAI GPT-4o: rigorous, step-by-step problem solver, clear academic rubrics, high school CBSE/PSEB board and tech bootcamp alignment, and structured numbered solutions.',
  },
  grok: {
    name: 'Grok-3',
    tagline: 'xAI • Witty & Pragmatic Real-World Explainer',
    systemPromptModifier:
      'Adopt the persona of xAI Grok-3: sharp, witty, punchy, no nonsense, using relatable everyday analogies (e.g. relatable Punjab real-world tech & coaching examples) while being technically accurate and fun.',
  },
};

function buildSystemPrompt(
  modelKey: string,
  studentContext?: {
    name?: string;
    courseTitle?: string;
    feeDue?: number;
    feeTotal?: number;
    rollNo?: string;
    pendingAssignmentsCount?: number;
  }
) {
  const profile = MODEL_PROFILES[modelKey] || MODEL_PROFILES.gemini;
  let prompt = `You are the official SkillBridge Bathinda AI Learning Assistant & Academic Coach.
SkillBridge is a premier coaching & technology institute located on Ajit Road / Model Town in Bathinda, Punjab, India.
We provide tracks in:
1. Full-Stack Web Development & Modern Coding (MERN, TypeScript, Node.js)
2. Python for Data Analytics & Automation
3. IELTS 7.5+ Band Academic Masterclass & Spoken English
4. CBSE & Punjab Board (PSEB) Classes 9th to 12th coaching (Mathematics, Physics, Chemistry, Computer Science)

${profile.systemPromptModifier}

Key Guidelines:
- Address the student politely and warmly.
- Keep answers grounded in curriculum concepts, giving clear examples or code snippets when asked.
- Provide practical study tips suitable for students preparing for tech jobs or board exams.
`;

  if (studentContext) {
    prompt += `\nStudent Context:
- Student Name: ${studentContext.name || 'Student'}
- Roll Number: ${studentContext.rollNo || 'SB-Student'}
- Enrolled Course: ${studentContext.courseTitle || 'SkillBridge Program'}
- Pending Assignments: ${studentContext.pendingAssignmentsCount ?? 0}
`;

    if (typeof studentContext.feeDue === 'number' && studentContext.feeDue > 0) {
      prompt += `
CRITICAL DIRECTIVE - FEE REMINDER:
The student currently has an OUTSTANDING FEE BALANCE of ₹${studentContext.feeDue.toLocaleString('en-IN')} (out of total ₹${studentContext.feeTotal?.toLocaleString('en-IN') || 'total'}).
- Institute policy requires you to naturally and politely remind the student about their pending dues in your response (e.g., at the end of your explanation or when talking about schedules/progress), asking them to request their parents to settle the balance or generate their GST invoice slip via the Fees tab so their batch access and test series remain uninterrupted.
- Be respectful and encouraging, not harsh or robotic.
`;
    }
  }

  return prompt;
}

// Fallback response generator if API key is unset or rate limited
function generateFallbackResponse(
  message: string,
  modelKey: string,
  studentContext?: { name?: string; courseTitle?: string; feeDue?: number }
) {
  const name = studentContext?.name || 'there';
  const course = studentContext?.courseTitle || 'your course';
  const feeDue = studentContext?.feeDue || 0;

  const feeNote =
    feeDue > 0
      ? `\n\n📌 **Important Note from Accounts**: Hi ${name}, institute records show an outstanding fee balance of **₹${feeDue.toLocaleString('en-IN')}** for ${course}. Please clear this via the institute office or view your GST invoice in the **Fees** tab to keep your batch access active.`
      : '';

  switch (modelKey) {
    case 'claude':
      return (
        `Hello ${name}! As your Claude 3.7 Sonnet mentor at SkillBridge Bathinda, let's explore your question thoughtfully:\n\n` +
        `Regarding "${message}": The fundamental concept here revolves around building a strong mental model. Break this down into three stages: understanding the core definitions, testing with a practical example, and observing edge cases.\n\n` +
        `Try reflecting on this: *How would your solution change if input constraints double?* Take a moment to experiment with the module code.` +
        feeNote
      );
    case 'gpt':
      return (
        `**Solution & Key Steps (GPT-4o)**\n\n` +
        `Here is the systematic breakdown for "${message}":\n\n` +
        `1. **Core Concept**: Align this with your ${course} syllabus standards.\n` +
        `2. **Step-by-Step Execution**: Verify your baseline formulas, review input parameters, and structure your output methodically.\n` +
        `3. **Best Practice**: Always validate test cases before final assignment submission on the portal.` +
        feeNote
      );
    case 'grok':
      return (
        `Hey ${name}! Grok-3 here from the Bathinda digital lab.\n\n` +
        `Let's cut right through the noise regarding "${message}":\n` +
        `Think of it like navigating the GT Road roundabout during peak hours—keep your lane clear, anticipate bottlenecks, and optimize for throughput! In ${course}, clean logic beats over-complicated code every single time.` +
        feeNote
      );
    case 'gemini':
    default:
      return (
        `**SkillBridge AI (Gemini 2.5 Flash)**\n\n` +
        `Here is a quick, structured breakdown for **${message}** in ${course}:\n\n` +
        `• **Key Insight**: Master the underlying fundamentals covered in your current batch module.\n` +
        `• **Action Item**: Check your latest assignment rubric in the Assignments tab to ensure full marks.\n` +
        `• **Practice Tip**: Spend 20 minutes daily reviewing active module lecture notes.` +
        feeNote
      );
  }
}

// POST /api/ai/chat
app.post('/api/ai/chat', async (req, res) => {
  const { message, model = 'gemini', studentContext, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemInstruction = buildSystemPrompt(model, studentContext);

  if (!aiClient) {
    const fallbackText = generateFallbackResponse(message, model, studentContext);
    return res.json({
      reply: fallbackText,
      modelUsed: model,
      isFallback: true,
    });
  }

  try {
    // Format conversation history for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.sender === 'user') {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'bot') {
          contents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }

    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as any,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || generateFallbackResponse(message, model, studentContext);

    return res.json({
      reply: replyText,
      modelUsed: model,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    const fallback = generateFallbackResponse(message, model, studentContext);
    return res.json({
      reply: fallback,
      modelUsed: model,
      isFallback: true,
      errorNote: error?.message,
    });
  }
});

// POST /api/ai/compare
app.post('/api/ai/compare', async (req, res) => {
  const { prompt, studentContext } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const models = ['gemini', 'claude', 'gpt', 'grok'] as const;

  if (!aiClient) {
    const results: Record<string, string> = {};
    for (const m of models) {
      results[m] = generateFallbackResponse(prompt, m, studentContext);
    }
    return res.json({ results, isFallback: true });
  }

  try {
    const promises = models.map(async (m) => {
      try {
        const sys = buildSystemPrompt(m, studentContext);
        const resp = await aiClient!.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: sys,
          },
        });
        return { model: m, text: resp.text || generateFallbackResponse(prompt, m, studentContext) };
      } catch (e) {
        return { model: m, text: generateFallbackResponse(prompt, m, studentContext) };
      }
    });

    const responses = await Promise.all(promises);
    const results: Record<string, string> = {};
    for (const r of responses) {
      results[r.model] = r.text;
    }

    return res.json({ results, isFallback: false });
  } catch (err: any) {
    console.error('Comparison error:', err);
    const results: Record<string, string> = {};
    for (const m of models) {
      results[m] = generateFallbackResponse(prompt, m, studentContext);
    }
    return res.json({ results, isFallback: true });
  }
});

// Dev vs Prod Vite Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SkillBridge Bathinda server running on http://0.0.0.0:${port}`);
  });
}

startServer();
