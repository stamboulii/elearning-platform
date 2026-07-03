import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Groq from 'groq-sdk';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/generate-summary', protect, authorize('INSTRUCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { title, keywords } = req.body;
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Tu es un expert en pédagogie. Pour une leçon intitulée "${title}", génère un résumé pédagogique complet (150-200 mots) basé sur ces mots clés : ${keywords}. Le résumé doit couvrir les concepts principaux, les définitions importantes et les points clés à retenir. Réponds uniquement avec le résumé, sans introduction ni conclusion.`
      }],
      temperature: 0.5,
      max_tokens: 400,
    });
    const summary = completion.choices[0]?.message?.content || '';
    res.json({ success: true, data: { summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
