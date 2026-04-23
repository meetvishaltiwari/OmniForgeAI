import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  buildDraftPrompt, buildEditorPrompt, buildIterationPrompt, buildRewritePrompt, 
  buildVisualsPrompt, buildEngagementPrompt, buildHookIntelligencePrompt, 
  buildAnglesBuilderPrompt, buildBodyBuilderPrompt, buildPolishBuilderPrompt,
  buildDiscoverPrompt, buildRepurposePrompt, buildCampaignIdeationPrompt, 
  buildCampaignAssetPrompt, buildTrendPrompt, buildFeedScraperPrompt
} from './prompts.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Mock database
let brandKits = [];
let activities = [];
let queue = [];
let sources = [];

async function callGemini(prompt, systemInstruction = '') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (response.status === 429) return { quotaExceeded: true, error: 'API Quota Exceeded (429)' };
  if (!response.ok) return { error: data.error?.message || 'Gemini API Error' };
  
  return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
}

// API Routes
app.get('/api/brand_kits', (req, res) => res.json(brandKits));
app.post('/api/brand_kits', (req, res) => {
  const kit = { ...req.body, id: Date.now().toString() };
  brandKits.push(kit);
  res.json(kit);
});

app.get('/api/activity', (req, res) => res.json(activities));
app.post('/api/activity', (req, res) => {
  activities.push(req.body);
  res.json({ success: true });
});

app.get('/api/queue', (req, res) => res.json(queue));
app.post('/api/schedule', (req, res) => {
  const item = { ...req.body, id: Date.now().toString(), status: 'Scheduled' };
  queue.push(item);
  res.json(item);
});

app.get('/api/sources', (req, res) => res.json(sources));
app.post('/api/sources', (req, res) => {
  const source = { ...req.body, id: Date.now(), source_type: req.body.source_url.includes('instagram') ? 'instagram' : 'web' };
  sources.push(source);
  res.json(source);
});

app.post('/api/generate', async (req, res) => {
  const prompt = buildDraftPrompt(req.body);
  const result = await callGemini(prompt);
  if (result.quotaExceeded) return res.status(429).json(result);
  if (result.error) return res.status(500).json(result);
  res.json({ post: result.text });
});

app.post('/api/iterate', async (req, res) => {
  const prompt = buildIterationPrompt(req.body.draft, req.body.instruction);
  const result = await callGemini(prompt);
  if (result.quotaExceeded) return res.status(429).json(result);
  res.json({ post: result.text });
});

app.post('/api/rewrite', async (req, res) => {
  const prompt = buildRewritePrompt(req.body.draft, req.body.instruction, req.body.platform);
  const result = await callGemini(prompt);
  res.json({ post: result.text });
});

app.post('/api/generate-hooks', async (req, res) => {
  const prompt = buildHookIntelligencePrompt(req.body.topic, req.body.niche, req.body.audience, req.body.goal, req.body.platform);
  const result = await callGemini(prompt);
  try {
     const cleaned = result.text.replace(/```json|```/g, '').trim();
     const hooks = JSON.parse(cleaned);
     res.json({ hooks });
  } catch(e) { res.json({ hooks: [], raw: result.text }); }
});

app.post('/api/repurpose', async (req, res) => {
  const prompt = buildRepurposePrompt(req.body.mode, req.body.sourceMaterial, req.body.platform);
  const result = await callGemini(prompt);
  try {
     const cleaned = result.text.replace(/```json|```/g, '').trim();
     res.json({ output: JSON.parse(cleaned) });
  } catch(e) { res.json({ output: result.text }); }
});

app.post('/api/generate-visuals', async (req, res) => {
  const prompt = buildVisualsPrompt(req.body.type, req.body.input, req.body.platform);
  const result = await callGemini(prompt);
  try {
     const cleaned = result.text.replace(/```json|```/g, '').trim();
     res.json({ output: JSON.parse(cleaned) });
  } catch(e) { res.json({ output: result.text }); }
});

app.post('/api/generate-engagement', async (req, res) => {
  const prompt = buildEngagementPrompt(req.body.type, req.body.content, req.body.tone, req.body.niche, req.body.platform);
  const result = await callGemini(prompt);
  res.json({ output: result.text });
});

app.post('/api/discover', async (req, res) => {
  const prompt = buildDiscoverPrompt(req.body.topic, req.body.niche, req.body.audience);
  const result = await callGemini(prompt);
  try {
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    res.json({ topics: JSON.parse(cleaned) });
  } catch(e) { res.json({ topics: [] }); }
});

app.post('/api/campaign/ideas', async (req, res) => {
  const prompt = buildCampaignIdeationPrompt(req.body.config);
  const result = await callGemini(prompt);
  try {
    const cleaned = result.text.replace(/```json|```/g, '').trim();
    res.json({ ideas: JSON.parse(cleaned) });
  } catch(e) { res.json({ ideas: [] }); }
});

app.post('/api/campaign/assets', async (req, res) => {
  const prompt = buildCampaignAssetPrompt(req.body.config, req.body.idea, req.body.channel);
  const result = await callGemini(prompt);
  if (req.body.channel === 'meta_ads') {
     try {
        const cleaned = result.text.replace(/```json|```/g, '').trim();
        const json = JSON.parse(cleaned);
        res.json({ copy: json.ad_copy_variants?.[0]?.primary_text?.medium || 'Meta Ad', rawData: json });
     } catch(e) { res.json({ copy: result.text }); }
  } else {
     res.json({ copy: result.text });
  }
});

app.post('/api/trend-analyse', async (req, res) => {
  const prompt = buildTrendPrompt(req.body.url, req.body.startDate, req.body.endDate);
  const result = await callGemini(prompt);
  try {
    const cleaned = result.text.split('CONFIRMED: ALL ENTRIES PRESENT')[1]?.trim() || result.text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(cleaned));
  } catch(e) { res.status(500).json({ error: 'Failed to parse trend matrix' }); }
});

app.get('/api/feed', async (req, res) => {
  // Simulate feed from tracking sources
  const feed = [
    { id: 1, handle: 'nike', avatar: 'https://logo.clearbit.com/nike.com', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', caption: 'Just do it. #nike', likes: '1.2M', comments: '12K', impressions: '15M', timestamp: '1h' },
    { id: 2, handle: 'stripe', avatar: 'https://logo.clearbit.com/stripe.com', image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62', caption: 'The future of payments is here.', likes: '45K', comments: '1.2K', impressions: '2.5M', timestamp: '4h' }
  ];
  res.json(feed);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
