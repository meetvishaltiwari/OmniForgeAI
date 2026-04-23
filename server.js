import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  buildDraftPrompt, buildEditorPrompt, buildIterationPrompt, buildRewritePrompt,
  buildVisualsPrompt, buildEngagementPrompt, buildHookIntelligencePrompt,
  buildHookRefinementPrompt, buildAnglesBuilderPrompt, buildBodyBuilderPrompt,
  buildPolishBuilderPrompt, buildScheduleInsightPrompt, buildDiscoverPrompt,
  buildRepurposePrompt, buildCampaignIdeationPrompt, buildCampaignAssetPrompt,
  buildTrendPrompt, buildFeedScraperPrompt
} from './prompts.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Model fallback chain: primary → Gemini 3 Flash → mid-tier → lite
const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-3.1-flash-lite-preview'];
const modelText = genAI.getGenerativeModel({ model: MODEL_CHAIN[0] }); // kept for legacy direct use

// Unified quota-aware error responder
const isQuotaError = (e) => e?.status === 429 || (e?.message && e.message.includes('429'));
const isNotFoundError = (e) => e?.status === 404 || (e?.message && e.message.includes('404'));

const sendError = (res, e) => {
  const quota = isQuotaError(e);
  const notFound = isNotFoundError(e);
  res.status(quota ? 429 : (notFound ? 404 : 500)).json({
    error: quota
      ? 'AI quota exceeded on all available models. Please wait a few minutes and try again.'
      : (notFound ? 'The requested AI model was not found.' : (e?.message || 'An unexpected error occurred.')),
    quotaExceeded: quota
  });
};

// Tries each model in MODEL_CHAIN until one succeeds. Throws only if all fail.
const generateWithFallback = async (promptOrParts) => {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(promptOrParts);
      if (modelName !== MODEL_CHAIN[0]) {
        console.log(`[Fallback] Used ${modelName} (primary quota exhausted)`);
      }
      return result;
    } catch (e) {
      lastError = e;
      if (isQuotaError(e) || isNotFoundError(e)) {
        console.warn(`[Fallback] ${modelName} ${isQuotaError(e) ? 'quota exceeded' : 'not found'}, trying next model...`);
        continue; // try next model
      }
      throw e; // non-quota/non-404 errors bubble up immediately
    }
  }
  throw lastError; // all models exhausted
};


const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const sanitizeCampaignConfig = (config = {}) => {
  const safeConfig = JSON.parse(JSON.stringify(config || {}));
  if (safeConfig.product_info?.uploaded_images) {
    safeConfig.product_info.uploaded_images = safeConfig.product_info.uploaded_images.map((img) => ({
      file_name: img?.file_name || '',
      format: img?.format || ''
    }));
  }
  return safeConfig;
};

const ensureColumns = (tableName, columns) => {
  db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
    if (err) {
      console.error(`Failed to inspect ${tableName}`, err.message);
      return;
    }

    const existingColumns = new Set(rows.map(row => row.name));
    columns.forEach(({ name, definition }) => {
      if (!existingColumns.has(name)) {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${name} ${definition}`, (alterErr) => {
          if (alterErr) console.error(`Failed adding ${name} to ${tableName}`, alterErr.message);
        });
      }
    });
  });
};

// --- MOCK DATABASE (In-Memory Queue for Scheduling) ---
let queue = [];
let postIdCounter = 1;

setInterval(() => {
  const now = new Date();
  for (let i = 0; i < queue.length; i++) {
    const post = queue[i];
    if (new Date(post.scheduleFor) <= now && post.status === 'pending') {
      post.status = 'published';
      if (post.autoRepost) {
        const recycleDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        queue.push({
          id: postIdCounter++, content: post.content, scheduleFor: recycleDate.toISOString(), autoRepost: true, status: 'pending', createdAt: new Date().toISOString()
        });
      }
    }
  }
}, 5000);

// --- SQLITE DATABASE INITIALIZATION ---
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error('Error opening database', err.message);
  else {
    console.log('[DATABASE] Connected to SQLite database.');
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS campaigns (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, goal TEXT, type TEXT, product_name TEXT, user_email TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      db.run(`CREATE TABLE IF NOT EXISTS generated_assets (id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER, channel TEXT, copy TEXT, image_url TEXT, user_email TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      db.run(`CREATE TABLE IF NOT EXISTS activity_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, feature_name TEXT, status TEXT, error_message TEXT, input_payload TEXT, output_payload TEXT, user_email TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      db.run(`CREATE TABLE IF NOT EXISTS feed_sources (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT, source_url TEXT, source_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      db.run(`CREATE TABLE IF NOT EXISTS feed_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER, author_name TEXT, handle TEXT, avatar TEXT, image TEXT, caption TEXT, likes TEXT, comments TEXT, impressions TEXT, timestamp TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      db.run(`CREATE TABLE IF NOT EXISTS brand_kits (id INTEGER PRIMARY KEY AUTOINCREMENT, user_email TEXT, brandName TEXT, domain TEXT, logo TEXT, colors TEXT, fonts TEXT, tone TEXT, audience TEXT, brandStory TEXT, contentPillars TEXT, ctaStyle TEXT, aiControls TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      ensureColumns('generated_assets', [
        { name: 'session_signature', definition: 'TEXT' },
        { name: 'idea_key', definition: 'TEXT' },
        { name: 'raw_data', definition: 'TEXT' },
        { name: 'asset_title', definition: 'TEXT' }
      ]);
    });
  }
});

// --- GLOBAL API LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(body) {
    const logTag = req.path;
    if (logTag !== '/api/activity_logs' && logTag.startsWith('/api/') && logTag !== '/api/queue' && req.method === 'POST') {
        const isError = res.statusCode >= 400 || body.error;
        let feature = logTag.replace('/api/', '');
        
        let safeInput = req.body ? JSON.parse(JSON.stringify(req.body)) : {};
        if(safeInput.product_info?.uploaded_images) {
            safeInput.product_info.uploaded_images.forEach(img => delete img.base64_data);
        }
        if(safeInput.config?.product_info?.uploaded_images) {
             safeInput.config.product_info.uploaded_images.forEach(img => delete img.base64_data);
        }

        const userEmail = req.headers['x-user-email'] || 'guest@example.com';
        db.run(`INSERT INTO activity_logs (feature_name, status, input_payload, output_payload, error_message, user_email) VALUES (?, ?, ?, ?, ?, ?)`,
           [
              feature, 
              isError ? 'failure' : 'success',
              JSON.stringify(safeInput),
              isError ? null : JSON.stringify(body),
              isError ? (body.error || 'Unknown Error') : null,
              userEmail
           ]
        );
    }
    return originalJson.call(this, body);
  };
  next();
});

app.get('/api/activity_logs', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  db.all(`SELECT * FROM activity_logs WHERE user_email = ? AND id IN (SELECT MAX(id) FROM activity_logs WHERE user_email = ? GROUP BY feature_name) ORDER BY created_at DESC`, [userEmail, userEmail], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- MULTER UPLOAD SETTINGS (MEMORY STORAGE) ---
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit

// --- VISION ENDPOINT & MOCK IMAGE ENDPOINT ---

app.post('/api/upload', upload.single('productImage'), async (req, res) => {
  try {
    if (!req.file) throw new Error("No image uploaded.");
    
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = `You are a world-class copywriter. Look at this product image and write a highly engaging, professional 3-sentence product description that highlights what the product is and its visual appeal.`;
    
    const result = await generateWithFallback([
      { text: prompt },
      { inlineData: { data: base64Data, mimeType } }
    ]);
    
    res.json({ description: result.response.text(), success: true });
  } catch (error) {
    console.error("Vision Upload Error:", error.message);
    const isQuota = error.status === 429 || (error.message && error.message.includes('429'));
    res.status(isQuota ? 429 : 500).json({
      error: isQuota
        ? 'AI quota exceeded. Your free-tier limit for today has been reached. Please wait a few minutes and try again.'
        : error.message,
      quotaExceeded: isQuota
    });
  }
});

app.post('/api/campaign/image_generate', async (req, res) => {
  try {
    const { idea, channel, sessionSignature, ideaKey } = req.body;
    const userEmail = req.headers['x-user-email'] || 'guest@example.com';
    
    const prompt = `Create a high-quality advertising asset image suitable for ${channel}. Creative idea: ${idea?.idea_summary || 'Product showcase'}. Make it highly professional and aesthetic.`;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' });
    
    let generatedUrl = '';
    try {
       // Attempt 1: Nano Banana 2
       const result = await model.generateContent(prompt);
       const obj = result.response;
       
       const inlinePart = obj?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
       if (inlinePart?.inlineData?.data) {
           const mime = inlinePart.inlineData.mimeType || 'image/png';
           generatedUrl = `data:${mime};base64,${inlinePart.inlineData.data}`;
       } else if (obj?.candidates?.[0]?.content?.parts?.[0]?.text) {
           const textOutput = obj.candidates[0].content.parts[0].text;
           if (textOutput.startsWith('http')) generatedUrl = textOutput;
       }
       
       if (!generatedUrl) throw new Error('No valid image data from Nano Banana 2');
    } catch (modelErr) {
       console.warn("Nano Banana 2 Generation Failed, trying Imagen 4 fallback:", modelErr.message);
       
       try {
           // Attempt 2: Imagen 4 Proxy (Prediction Endpoint)
           const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GEMINI_API_KEY}`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
           });
           
           const data = await response.json();
           
           if (!response.ok) {
               throw new Error(data.error?.message || 'Imagen 4 API request failed');
           }
           
           if (data?.predictions?.[0]?.bytesBase64Encoded) {
               generatedUrl = `data:${data.predictions[0].mimeType || 'image/png'};base64,${data.predictions[0].bytesBase64Encoded}`;
           } else {
               throw new Error('Unrecognized response structure from Imagen 4');
           }
           
       } catch (fallbackErr) {
           console.error("Imagen 4 Fallback Failed:", fallbackErr.message);
           const keywordText = encodeURIComponent(idea?.idea_summary?.substring(0, 20) || 'Campaign Asset');
           generatedUrl = `https://placehold.co/1080x1080/4f46e5/ffffff?text=${keywordText}%0A[All+AI+Generators+Failed]`;
       }
    }

    if (sessionSignature && ideaKey) {
      db.run(
        `UPDATE generated_assets SET image_url = ?, user_email = COALESCE(user_email, ?)
         WHERE session_signature = ? AND idea_key = ? AND channel = ?`,
        [generatedUrl, userEmail, sessionSignature, ideaKey, channel],
        function(err) {
          if (err) console.error('Generated asset image update failed', err.message);
          else if (this.changes === 0) {
            db.run(
              `INSERT INTO generated_assets (session_signature, idea_key, asset_title, channel, image_url, user_email)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [sessionSignature, ideaKey, idea?.idea_summary || 'Asset', channel, generatedUrl, userEmail],
              (insertErr) => { if (insertErr) console.error('Generated asset image insert fail', insertErr.message); }
            );
          }
        }
      );
    }
    res.json({ success: true, url: generatedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STANDARD ENDPOINTS ---

app.post('/api/generate', async (req, res) => {
  try {
    const { topic, audience, tone, keywords, cta, hookStyle, formatTemplate, platform } = req.body;
    const draftText = (await generateWithFallback(buildDraftPrompt({ topic, audience, tone, keywords, cta, hookStyle, formatTemplate, platform }))).response.text();
    const finalText = (await generateWithFallback(buildEditorPrompt(draftText, platform))).response.text();
    res.json({ draft: draftText, post: finalText });
  } catch (error) { sendError(res, error); }
});

app.post('/api/iterate', async (req, res) => {
  try { res.json({ post: (await generateWithFallback(buildIterationPrompt(req.body.post, req.body.action, req.body.platform))).response.text() }); } 
  catch (error) { sendError(res, error); }
});

app.post('/api/generate-hooks', async (req, res) => {
  try {
    const { topic, niche, audience, goal, tone, platform, angle } = req.body;
    const prompt = buildHookIntelligencePrompt({ topic, niche, audience, goal, tone, platform, angle });

    let text = (await generateWithFallback(prompt)).response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (error) { sendError(res, error); }
});

app.post('/api/refine-hook', async (req, res) => {
  try {
    const { original_hook, refinement_type } = req.body;
    const prompt = buildHookRefinementPrompt(original_hook, refinement_type);

    let text = (await generateWithFallback(prompt)).response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (error) { sendError(res, error); }
});

// --- POST BUILDER WIZARD ENDPOINTS ---

app.post('/api/builder/angles', async (req, res) => {
  try {
    const { idea, audience, goal, platform } = req.body;
    const prompt = buildAnglesBuilderPrompt({ idea, audience, goal, platform });

    let text = (await generateWithFallback(prompt)).response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    res.json({ angles: JSON.parse(text) });
  } catch (error) { sendError(res, error); }
});

app.post('/api/builder/body', async (req, res) => {
  try {
    const { idea, angle, hook, audience, evidence, format, tone, platform } = req.body;
    const prompt = buildBodyBuilderPrompt({ idea, angle, hook, audience, evidence, format, tone, platform });

    let text = (await generateWithFallback(prompt)).response.text().trim();
    res.json({ body: text });
  } catch (error) { sendError(res, error); }
});

app.post('/api/builder/polish', async (req, res) => {
  try {
    const { body_text, ctaStyle, niche, audience, platform } = req.body;
    const prompt = buildPolishBuilderPrompt({ body_text, ctaStyle, niche, audience, platform });

    let text = (await generateWithFallback(prompt)).response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (error) { sendError(res, error); }
});

app.post('/api/rewrite', async (req, res) => {
  try { res.json({ post: (await generateWithFallback(buildRewritePrompt(req.body.draft, req.body.instruction, req.body.platform))).response.text() }); } 
  catch (error) { sendError(res, error); }
});

app.post('/api/generate-visuals', async (req, res) => {
  try {
    const { type, input, platform } = req.body;
    let text = (await generateWithFallback(buildVisualsPrompt(type, input, platform))).response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`mermaid/g, '').replace(/\`\`\`/g, '').trim();
    if (type === 'carousel' || type === 'quote') res.json({ output: JSON.parse(text) });
    else res.json({ output: text });
  } catch (error) { sendError(res, error); }
});

app.post('/api/generate-engagement', async (req, res) => {
  try {
    const { type, content, tone, niche, platform } = req.body;
    res.json({ output: (await generateWithFallback(buildEngagementPrompt(type, content, tone, niche, platform))).response.text() });
  } catch (error) { sendError(res, error); }
});

// --- NEW SCHEDULER ENDPOINTS ---

app.post('/api/schedule', (req, res) => {
  try {
    const { content, scheduleFor, autoRepost } = req.body;
    if (!content || !scheduleFor) throw new Error("Missing content or target timestamp");
    const newPost = { id: postIdCounter++, content, scheduleFor, autoRepost: !!autoRepost, status: 'pending', createdAt: new Date().toISOString() };
    queue.push(newPost);
    res.json({ success: true, item: newPost });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/queue', (req, res) => {
  res.json({ items: [...queue].sort((a,b) => new Date(a.scheduleFor).getTime() - new Date(b.scheduleFor).getTime()) });
});

app.post('/api/insights', async (req, res) => {
  try {
    const targetPlatform = req.body.platform || 'All Platforms';
    const prompt = buildScheduleInsightPrompt(targetPlatform, req.body.audience);
    const result = await generateWithFallback(prompt);
    res.json({ insights: result.response.text() });
  } catch(e) { sendError(res, e); }
});

app.post('/api/discover', async (req, res) => {
  try {
    const { action, niche, audience } = req.body;
    const prompt = buildDiscoverPrompt(action, niche, audience);
    const result = await generateWithFallback(prompt);
    res.json({ output: result.response.text() });
  } catch(e) { sendError(res, e); }
});

// --- REPURPOSE ENGINE ENDPOINT ---

app.post('/api/repurpose', async (req, res) => {
  try {
    const { mode, sourceMaterial, platform } = req.body;
    const prompt = buildRepurposePrompt(mode, sourceMaterial, platform);
    
    let text = (await generateWithFallback(prompt)).response.text();
    if (mode === 'blog_to_carousel') {
      text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      res.json({ output: JSON.parse(text) });
    } else {
      res.json({ output: text });
    }
  } catch(e) { sendError(res, e); }
});

// --- CAMPAIGN WIZARD ENDPOINTS ---

app.post('/api/campaign/ideas', async (req, res) => {
  try {
    const config = req.body;
    let safeConfig = JSON.parse(JSON.stringify(config));
    if(safeConfig.product_info?.uploaded_images) {
      safeConfig.product_info.uploaded_images.forEach(img => { delete img.base64_data; });
    }
    
    // As part of DB Integration save this config to SQLite campaigns table
    db.run(`INSERT INTO campaigns (name, goal, type, product_name) VALUES (?, ?, ?, ?)`, [config.campaign_name, config.campaign_goal, config.campaign_type, config.product_info?.name], function(err) {
      if(err) console.error("DB Insert Error", err);
    });

    const prompt = buildCampaignIdeationPrompt(safeConfig);

    let text = (await generateWithFallback(prompt)).response.text();
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    res.json(JSON.parse(text));
  } catch(e) {
    console.error("Ideation API Error:", e);
    const isQuota = e.status === 429 || (e.message && e.message.includes('429'));
    res.status(isQuota ? 429 : 500).json({
      error: isQuota
        ? 'AI quota exceeded. Your free-tier daily limit has been reached. Please wait a few minutes and try again.'
        : e.message,
      quotaExceeded: isQuota
    });
  }
});

app.post('/api/campaign/assets', async (req, res) => {
  try {
    const { idea, channel, config, sessionSignature, ideaKey } = req.body;
    if(config?.product_info?.uploaded_images) {
      config.product_info.uploaded_images.forEach(img => { delete img.base64_data; });
    }
    
    // Fetch Channel Config
    const chConfig = config?.channelConfigs?.[channel] || {};
    const dimensions = chConfig.dimensions || '1080x1080';
    const postFormat = chConfig.postFormat || 'single';

    const fullPrompt = buildCampaignAssetPrompt(channel, postFormat, dimensions, idea, config);

    let generatedRawText = (await generateWithFallback(fullPrompt)).response.text();
    generatedRawText = generatedRawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    let generatedObj;
    try {
      generatedObj = JSON.parse(generatedRawText);
    } catch(e) {
      console.error("JSON Parse fail:", generatedRawText);
      throw new Error("AI failed to return valid JSON.");
    }

    // Format output beautifully for the UI since the UI expects 'copy' as a string containing the text.
    let formattedText = '';
    if (channel === 'instagram') {
      formattedText = `[Instagram Caption]\n${generatedObj?.caption?.text || 'No caption generated.'}\n\n[DALL-E Concept Prompt]\n${JSON.stringify(generatedObj?.generation_prompt || {}, null, 2)}`;
    } else if (channel === 'linkedin') {
      formattedText = `[LinkedIn Copy]\n${generatedObj?.copy?.text || 'No copy generated.'}\n\n[DALL-E Concept Prompt]\n${JSON.stringify(generatedObj?.generation_prompt || {}, null, 2)}`;
    } else {
      const variant = generatedObj?.ad_copy_variants?.[0] || {};
      const rationale = generatedObj?.performance_rationale || {};
      const metrics = rationale.expected_metrics || {};
      const best = rationale.best_recommendation || {};
      
      formattedText = `[Meta Ad - Copy Variant]\nHeadline: ${variant.headline || ''}\nDescription: ${variant.description || ''}\nPrimary Text: ${variant.primary_text?.medium || variant.primary_text?.short || ''}\nCTA: ${variant.CTA_button || ''}\n\n[Performance Metrics & Rationale]\nExpected CTR: ${metrics.CTR || 'N/A'}\nExpected ROAS: ${metrics.ROAS || 'N/A'}\nCAC: ${metrics.CAC || 'N/A'}\nWhy this works: ${(rationale.why_this_image_works || []).join(' ')}\n\n[Recommendation]\nStarting Creative: ${best.starting_creative || ''}\nPriority Audience: ${best.priority_audience || ''}\n\n[DALL-E Prompt Config]\n${JSON.stringify(generatedObj?.generation_prompt || {}, null, 2)}`;
    }

    const userEmail = req.headers['x-user-email'] || 'guest@example.com';

    if (sessionSignature && ideaKey) {
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM generated_assets WHERE session_signature = ? AND idea_key = ? AND channel = ?`,
          [sessionSignature, ideaKey, channel],
          (deleteErr) => {
            if (deleteErr) {
              reject(deleteErr);
              return;
            }

            db.run(
              `INSERT INTO generated_assets (session_signature, idea_key, asset_title, channel, copy, raw_data, user_email)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [sessionSignature, ideaKey, idea?.idea_summary || '', channel, formattedText, JSON.stringify(generatedObj), userEmail],
              insertErr => insertErr ? reject(insertErr) : resolve(null)
            );
          }
        );
      });
    } else {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO generated_assets (channel, copy, raw_data, user_email) VALUES (?, ?, ?, ?)`,
          [channel, formattedText, JSON.stringify(generatedObj), userEmail],
          insertErr => insertErr ? reject(insertErr) : resolve(null)
        );
      });
    }

    res.json({ copy: formattedText, rawData: generatedObj });
  } catch(e) {
    console.error("Asset Gen Error:", e);
    sendError(res, e);
  }
});

app.post('/api/generated-assets/history', (req, res) => {
  const { sessionSignature, config, ideaLookup } = req.body;
  if (!sessionSignature) return res.json({ assets: {} });

  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  db.all(
    `SELECT * FROM generated_assets
     WHERE user_email = ? AND session_signature = ?
     ORDER BY datetime(created_at) DESC, id DESC`,
    [userEmail, sessionSignature],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const assets = {};
      rows.forEach((row) => {
        if (!row.idea_key) return;
        if (!assets[row.idea_key]) {
          assets[row.idea_key] = {
            channel: row.channel,
            copy: row.copy || '',
            image: row.image_url || '',
            rawData: row.raw_data ? safeJsonParse(row.raw_data, null) : null
          };
          return;
        }

        assets[row.idea_key] = {
          channel: assets[row.idea_key].channel || row.channel,
          copy: assets[row.idea_key].copy || row.copy || '',
          image: assets[row.idea_key].image || row.image_url || '',
          rawData: assets[row.idea_key].rawData || (row.raw_data ? safeJsonParse(row.raw_data, null) : null)
        };
      });

      if (Object.keys(assets).length > 0 || !config || !ideaLookup) {
        res.json({ assets });
        return;
      }

      const normalizedConfig = JSON.stringify(sanitizeCampaignConfig(config));
      db.all(
        `SELECT feature_name, input_payload, output_payload
         FROM activity_logs
         WHERE user_email = ? AND feature_name IN ('campaign/assets', 'campaign/image_generate')
         ORDER BY datetime(created_at) DESC, id DESC`,
        [userEmail],
        (historyErr, historyRows) => {
          if (historyErr) return res.status(500).json({ error: historyErr.message });

          const restoredAssets = {};
          historyRows.forEach((row) => {
            const input = safeJsonParse(row.input_payload, {});
            const output = safeJsonParse(row.output_payload, {});
            const ideaSummary = input?.idea?.idea_summary;
            const matchedIdeaKey = ideaLookup?.[ideaSummary];
            if (!matchedIdeaKey) return;

            if (row.feature_name === 'campaign/assets') {
              const loggedConfig = JSON.stringify(sanitizeCampaignConfig(input?.config || {}));
              if (loggedConfig !== normalizedConfig) return;

              restoredAssets[matchedIdeaKey] = {
                channel: input?.channel || '',
                copy: output?.copy || '',
                image: restoredAssets[matchedIdeaKey]?.image || '',
                rawData: output?.rawData || null
              };
            }

            if (row.feature_name === 'campaign/image_generate' && restoredAssets[matchedIdeaKey] && output?.url) {
              restoredAssets[matchedIdeaKey] = {
                ...restoredAssets[matchedIdeaKey],
                image: restoredAssets[matchedIdeaKey].image || output.url
              };
            }
          });

          res.json({ assets: restoredAssets });
        }
      );
    }
  );
});
app.post('/api/trend-analyse', async (req, res) => {
  try {
     const { startDate, endDate, url } = req.body;
     const prompt = buildTrendPrompt(startDate, endDate, url);

     let generatedRawText = (await generateWithFallback(prompt)).response.text();
    
    // Safely extract JSON array bypassing Markdown or Confirmation prepends
    const jsonStartIdx = generatedRawText.indexOf('[');
    const jsonEndIdx = generatedRawText.lastIndexOf(']');
    
    if (jsonStartIdx === -1 || jsonEndIdx === -1) {
       throw new Error("Failed to parse JSON array from AI output.");
    }
    
    const cleanJsonString = generatedRawText.substring(jsonStartIdx, jsonEndIdx + 1);
    const parsedData = JSON.parse(cleanJsonString);
    
    res.json(parsedData);
  } catch(e) {
    console.error("Trend Analyser Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// --- BRAND KITS & PROXY ---
app.post('/api/brandfetch', async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });
  const apiKey = process.env.BRANDFETCH_API_KEY;
  if (!apiKey) return res.status(401).json({ error: 'BRANDFETCH_API_KEY not configured. Falling back to manual entry.' });

  try {
    const fetchRes = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
       headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!fetchRes.ok) throw new Error('API throw ' + fetchRes.status);
    const data = await fetchRes.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/brand_kits', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  db.all('SELECT * FROM brand_kits WHERE user_email = ? ORDER BY id DESC', [userEmail], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map(r => ({
       ...r,
       colors: JSON.parse(r.colors || '{}'),
       fonts: JSON.parse(r.fonts || '[]'),
       contentPillars: JSON.parse(r.contentPillars || '[]'),
       aiControls: JSON.parse(r.aiControls || '{}')
    }));
    res.json(parsed);
  });
});

app.post('/api/brand_kits', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  const { brandName, domain, logo, colors, fonts, tone, audience, brandStory, contentPillars, ctaStyle, aiControls } = req.body;
  
  db.get('SELECT COUNT(*) as count FROM brand_kits WHERE user_email = ?', [userEmail], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count >= 5) return res.status(400).json({ error: 'Maximum 5 brand kits allowed.' });
    
    db.run(`INSERT INTO brand_kits (user_email, brandName, domain, logo, colors, fonts, tone, audience, brandStory, contentPillars, ctaStyle, aiControls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [userEmail, brandName, domain, logo, JSON.stringify(colors||{}), JSON.stringify(fonts||[]), tone, audience, brandStory, JSON.stringify(contentPillars||[]), ctaStyle, JSON.stringify(aiControls||{})], 
      function(insErr) {
        if (insErr) return res.status(500).json({ error: insErr.message });
        res.json({ success: true, id: this.lastID });
      }
    );
  });
});

app.delete('/api/brand_kits/:id', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  db.run('DELETE FROM brand_kits WHERE id = ? AND user_email = ?', [req.params.id, userEmail], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- FEED FEATURE ENDPOINTS & WORKER ---

app.get('/api/feed/sources', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  db.all('SELECT * FROM feed_sources WHERE user_email = ? ORDER BY created_at DESC', [userEmail], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/feed/sources', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  const { sourceUrl } = req.body;
  if (!sourceUrl) return res.status(400).json({ error: 'Source URL required' });
  
  db.get('SELECT COUNT(*) as count FROM feed_sources WHERE user_email = ?', [userEmail], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count >= 10) return res.status(400).json({ error: 'Maximum 10 sources allowed.' });
    
    const type = sourceUrl.includes('instagram.com') ? 'instagram' : 'web';
    db.run('INSERT INTO feed_sources (user_email, source_url, source_type) VALUES (?, ?, ?)', [userEmail, sourceUrl, type], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      setTimeout(scrapeSources, 1000);
      res.json({ success: true, id: this.lastID });
    });
  });
});

app.delete('/api/feed/sources/:id', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  db.run('DELETE FROM feed_sources WHERE id = ? AND user_email = ?', [req.params.id, userEmail], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/feed/posts', (req, res) => {
  const userEmail = req.headers['x-user-email'] || 'guest@example.com';
  // Join feed_posts and feed_sources ensures user only sees posts from their tracked sources.
  db.all(
    `SELECT p.* FROM feed_posts p 
     JOIN feed_sources s ON p.source_id = s.id 
     WHERE s.user_email = ? 
     ORDER BY p.id DESC LIMIT 100`, 
    [userEmail], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Mock Scraping Engine Worker (Every 30 Mins = 1800000ms. For testing, using 15s delay initially, then every 30m)
const scrapeSources = () => {
   db.all('SELECT * FROM feed_sources', async (err, sources) => {
     if (err || !sources || sources.length === 0) return;
     
     for (const source of sources) {
       try {
         const prompt = buildFeedScraperPrompt(source.source_url);
         let aiResponse = (await generateWithFallback(prompt)).response.text();
         aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
         const data = JSON.parse(aiResponse);
         
         db.run(
           `INSERT INTO feed_posts (source_id, author_name, handle, avatar, image, caption, likes, comments, impressions, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
           [source.id, data.author_name, data.handle, data.avatar, data.image, data.caption, data.likes, data.comments, data.impressions, data.timestamp],
           (insertErr) => { if (insertErr) console.error('Feed post insert fail', insertErr.message); }
         );
       } catch (mockErr) {
          console.error('Scrape Fail:', mockErr.message);
       }
     }
   });
};

setInterval(scrapeSources, 1800000);

app.listen(PORT, () => {
  console.log(`[SERVER] OmniForge AI Backend running on port ${PORT}`);
});
