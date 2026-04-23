/**
 * prompts.js
 * Centralized repository for all AI prompts across the platform.
 * Ensures consistent output schemas and manageable prompt engineering.
 */

const HOOKS = {
  contra: 'The Contra-opinion: Start with a bold, contrasting statement to common beliefs.',
  stats: 'The Statistical Shock: Open with a surprising metric or data point.',
  vulnerable: 'The Vulnerable Story: Lead with a personal failure or struggle that taught a lesson.',
  how_to: 'The "How-To" Teaser: Promise clear, actionable steps to solve a specific problem.',
  question: 'The Provocative Question: Ask a question that makes the reader pause and reflect.'
};

const TEMPLATES = {
  standard: 'A standard professional post with an intro, body, and conclusion.',
  story: 'A narrative arc. Start with a hook, introduce a conflict/struggle, detail the turning point, and end with the lesson learned.',
  listicle: 'A highly scannable list format. Use bullet points or numbered lists to breakdown the content, keeping sentences very brief.',
  contrarian: 'A contrarian layout. State the popular opinion, disprove it, and present a new framework.',
  step_by_step: 'A tactical step-by-step guide. "Step 1: ..., Step 2: ..." format.'
};

const PLATFORM_GUIDELINES = {
  LinkedIn: "Post length: 1300-2000 characters. Hook length: 1-2 punchy lines (under 200 chars). Hashtags: 3-5 niche tags. Formats: Professional spacing, clear takeaways.",
  Twitter: "Post length: Max 280 characters per tweet. Hook length: First 50 chars critical. Hashtags: 1-2 tags optimal. Formats: Highly punchy, threading context.",
  Instagram: "Post length: 125-150 chars before truncation. Hook length: 1 crisp line. Hashtags: 5-10 targeted tags. Formats: High visual descriptions, heavy emoji usage.",
  Facebook: "Post length: 40-80 chars ideal but up to 400. Hook length: Casual opening. Hashtags: 1-3 tags. Formats: Conversational, community-driven.",
  Omnichannel: "Post length: Moderate. Hook length: 1-2 sentences. Hashtags: 3-5 standard tags. Formats: Adaptable style."
};

const getGuidelines = (platform) => PLATFORM_GUIDELINES[platform] || PLATFORM_GUIDELINES.Omnichannel;
const PERSONA = "You are a senior omnichannel marketer and brand manager with 25+ years of experience.";

/**
 * Builds the initial drafting prompt.
 * @param {Object} args - Topic, audience, tone, keywords, cta, hookStyle, formatTemplate.
 * @returns {string} The prompt text.
 */
function buildDraftPrompt({ topic, audience, tone, keywords, cta, hookStyle, formatTemplate, platform = 'LinkedIn' }) {
  const hookInstruction = HOOKS[hookStyle] || HOOKS.how_to;
  const templateInstruction = TEMPLATES[formatTemplate] || TEMPLATES.standard;
  const platformRules = getGuidelines(platform);

  return `${PERSONA} Draft a high-performing ${platform} post based on the following context.
Context:
- Platform: ${platform}
- Topic: ${topic}
- Target Audience: ${audience}
- Desired Tone: ${tone}
- Keywords to include: ${keywords}
- Call to Action: ${cta}
 
Instructions:
1. Hook Style to use: ${hookInstruction}
2. Format Template to use: ${templateInstruction}
3. Platform Optimization Guidelines: ${platformRules}
4. Ensure the post feels natural and human-written. Do NOT use cliches like "In the ever-evolving landscape".
5. Draft the post.`;
}

/**
 * Builds the editing/refining prompt.
 * @param {string} draft - The current post draft.
 * @returns {string} The prompt text.
 */
function buildEditorPrompt(draft, platform = 'LinkedIn') {
  const platformRules = getGuidelines(platform);
  return `${PERSONA} Your job is to strictly refine a draft to make it perform perfectly on ${platform}.
Review the following draft:
---
${draft}
---
Your Task:
1. Make the hook punchier. The first two lines must compel the reader to click 'see more'.
2. Remove any fluff, filler words, or AI-sounding cliches. 
3. strictly adhere to the following platform constraints: ${platformRules}
4. Provide ONLY the finalized post text.`;
}

/**
 * Standard iteration prompt (e.g. shorter, emojis, regenerate).
 * @param {string} post - Existing post text.
 * @param {string} action - 'shorter', 'emojis', 'regenerate', etc.
 * @returns {string} Prompt string.
 */
function buildIterationPrompt(post, action, platform = 'LinkedIn') {
  let instruction = '';
  switch (action) {
    case 'shorter': instruction = "Make the post significantly shorter and more concise."; break;
    case 'emojis': instruction = "Add appropriate, professional emojis throughout the post."; break;
    case 'regenerate': instruction = "Regenerate the post from scratch with a slightly different angle."; break;
    default: instruction = "Improve the post generally.";
  }
  const platformRules = getGuidelines(platform);
  return `${PERSONA} 
Here is a draft for ${platform}:
---
${post}
---
Action required: ${instruction}
Platform Constraints to respect: ${platformRules}
Provide ONLY the updated post text.`;
}

/**
 * Free-form rewriting prompt.
 * @param {string} draft - The draft to rewrite.
 * @param {string} instruction - The user's custom instruction.
 * @returns {string} Prompt string.
 */
function buildRewritePrompt(draft, instruction, platform = 'LinkedIn') {
  const platformRules = getGuidelines(platform);
  return `${PERSONA} A user has brought you an existing draft for ${platform} that needs fixing.
Original Draft:
---
${draft}
---
Improvement Directive: ${instruction}
Instructions:
1. Apply the improvement directive perfectly.
2. Remove any fluff or AI-sounding cliches. 
3. Strictly abide by these platform formatting rules: ${platformRules}
4. Provide ONLY the finalized rewritten post text.`;
}

/**
 * Visual generator (Carousel, Quote, Mermaid Infographic).
 * @param {string} type - 'carousel', 'quote', or 'infographic'.
 * @param {string} input - Topic.
 * @returns {string} Prompt string.
 */
function buildVisualsPrompt(type, input, platform = 'LinkedIn') {
  if (type === 'carousel') return `${PERSONA} Create a highly engaging ${platform} carousel about the following topic: ${input}. Break the topic down into 5 to 7 slides. Each slide should have a short, punchy 'title' and a brief explanatory 'body'. Format your response STRICTLY as a JSON array where each object has 'title' and 'body' properties.`;
  if (type === 'quote') return `${PERSONA} Extract a highly inspiring, standalone, viral quote regarding the following topic: ${input}. Also provide an author. Format STRICTLY as a JSON object with 'quote' and 'author'.`;
  if (type === 'infographic') return `${PERSONA} Create a Mermaid.js diagram to visually represent: ${input}. Return ONLY the raw Mermaid syntax block containing the diagram (do not wrap in markdown \`\`\`mermaid).`;
}

/**
 * Engagement Assistant prompt (Comments, Replies, Feed Analysis).
 * @param {string} type - 'comment', 'reply', or 'feed_analyzer'.
 * @param {string} content - Thread text.
 * @param {string} tone - Desired tone.
 * @param {string} niche - Niche context.
 * @returns {string} Prompt string.
 */
function buildEngagementPrompt(type, content, tone, niche, platform = 'LinkedIn') {
  if (type === 'comment') return `${PERSONA} Write an exceptional comment for the following ${platform} post. Context: --- ${content} --- Directives: 1. Tone must be: ${tone}. 2. Keep it to 1-3 short sentences max. Output ONLY the exact comment text.`;
  if (type === 'reply') return `${PERSONA} Write a reply to the following comment/message on ${platform}. Context: --- ${content} --- Directives: 1. Tone must be: ${tone}. 2. Output ONLY the exact reply text.`;
  if (type === 'feed_analyzer') return `You are a strategic Omnichannel Growth Hacker. User's Target Niche: ${niche}\nRaw Feed Dump from ${platform}: --- ${content} --- Your task: Identify up to 3 high-impact posts from that text that align with the niche. Extract author/topic and write exactly what the user should comment to gain visibility. Output safely in markdown format.`;
}

/**
 * Hook Intelligence Engine prompt generating exactly 10 structured hooks.
 * @param {Object} args
 * @returns {string} JSON-enforced Prompt string.
 */
function buildHookIntelligencePrompt({ topic, niche, audience, goal, tone, platform = 'LinkedIn', angle }) {
  const platformRules = getGuidelines(platform);
  return `${PERSONA} You are building a Hook Intelligence System for ${platform}.
Generate 10 highly optimized opening hooks based on the following parameters:
Topic / Core Idea: ${topic}
Selected Angle: ${angle || 'Contrarian'}
Niche: ${niche || 'General'}
Audience: ${audience || 'Professionals'}
Goal: ${goal || 'Engage'}
Tone: ${tone || 'Professional'}
Platform: ${platform}

Apply the Hook Strategy Engine formula:
Hook = Pattern Interrupt + Trigger + Curiosity Gap + Power Word
Platform Constraints to respect implicitly: ${platformRules}

You MUST generate exactly 10 hooks using DIFFERENT formats:
1. Contrarian
2. Pain Amplifier
3. Curiosity Loop
4. "Steal This"
5. Mistake
6. Before/After
7. Authority
8. Insider Secret
9. Fast Result
10. Challenge

Output MUST be strictly a JSON object matching this exact schema:
{
  "hooks": [
    {
      "original": "The main hook text...",
      "format": "Pattern Interrupt",
      "trigger": "Curiosity",
      "intent": "Engage",
      "scores": { "scrollStop": 8, "curiosity": 9, "clarity": 7 },
      "variations": {
         "short": "Shorter punchy version",
         "aggressive": "Bold aggressive version",
         "curiosity_max": "Curiosity maximizing version"
      }
    }
  ]
}
Do not use markdown formatting like \`\`\`json... just return the raw JSON text.`;
}

/**
 * Hook Refinement prompt making single hook variations.
 * @param {string} original_hook
 * @param {string} refinement_type
 * @returns {string} Prompt string.
 */
function buildHookRefinementPrompt(original_hook, refinement_type) {
  let instruction = "";
  if (refinement_type === 'contrarian') instruction = "Make this hook highly contrarian, going against common industry wisdom.";
  else if (refinement_type === 'curiosity') instruction = "Maximize the curiosity gap. Remove resolving details so they HAVE to read the post.";
  else if (refinement_type === 'shorten') instruction = "Make it aggressively concise. Keep only the punchiest words.";
  else if (refinement_type === 'aggressive') instruction = "Make the tone bolder, hitting pain points directly without sugarcoating.";
  else instruction = "Enhance this hook to be more engaging.";

  return `You are an elite copy editor. Refine the following social media hook based strictly on this instruction: "${instruction}"
Original Hook: "${original_hook}"
Output MUST be strictly a JSON object with this exact shape: { "refined_hook": "The new hook text" }
Do not use markdown wrappers.`;
}

/**
 * Post Builder: Angles Generator
 * @param {Object} args
 * @returns {string} Prompt string.
 */
function buildAnglesBuilderPrompt({ idea, audience, goal, platform = 'LinkedIn' }) {
  return `${PERSONA} Based on the core idea: "${idea}" for the audience: "${audience}" with the goal: "${goal}", suggest exactly 5 distinct angles to approach this ${platform} post. 
Examples of angles: Contrarian, Story, Framework, Mistake, Lesson Learned.
Output MUST be strictly a JSON array of objects with \`name\` and \`description\`, like: [{"name": "The Contrarian Take", "description": "Argue why the standard advice fails."}]
Return ONLY the raw JSON array. No code blocks.`;
}

/**
 * Post Builder: Body Draft Generator
 * @param {Object} args
 * @returns {string} Prompt string.
 */
function buildBodyBuilderPrompt({ idea, angle, hook, audience, evidence, format, tone, platform = 'LinkedIn' }) {
  const platformRules = getGuidelines(platform);
  return `${PERSONA} You are executing the POST GENERATION ENGINE for ${platform}.
Write the BODY of the post (do not include the hook, and do not include a CTA at the end).
Core Idea: "${idea}"
Selected Angle: "${angle}"
Opening Hook (do not repeat this): "${hook}"
Audience: "${audience}"
Evidence Style: "${evidence}"
Format Type: "${format}"
Tone: "${tone}"

Instructions for the structured body:
1. Move from context/problem -> insight/shift -> explanation -> proof -> takeaway.
2. Structure the proof section heavily based on the Evidence Style.
3. Inject power words, curiosity gaps, and emotional tension.
4. Formatting Constraints for ${platform}: ${platformRules}

Return ONLY the raw text of the body draft. No markdown wrappers.`;
}

/**
 * Post Builder: CTA & Hashtags Generator
 * @param {Object} args
 * @returns {string} Prompt string.
 */
function buildPolishBuilderPrompt({ body_text, ctaStyle, niche, audience, platform = 'LinkedIn' }) {
  const platformRules = getGuidelines(platform);
  return `${PERSONA} Analyze the body:
"${body_text}"

Based on the requested CTA Style "${ctaStyle}", suggest:
1. 3 distinct, strong Call To Actions (CTAs) matching that style optimally for ${platform}.
2. Specific, niche hashtags optimized for ${niche} & ${audience} reflecting ${platform} best practices.
Platform rules context: ${platformRules}

Output MUST be strictly JSON format matching this exact shape:
{
  "ctas": ["CTA 1", "CTA 2", "CTA 3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}
Return ONLY raw JSON, without markdown.`;
}

/**
 * Schedule insights simple prompt.
 */
function buildScheduleInsightPrompt(platform, audience) {
  return `You are an elite data scientist studying social media patterns. Based on active algorithm trends on ${platform} for ${audience}, suggest the optimal posting schedule and 1-2 rapid format strategies in a brief 3-4 sentence incredibly confident recommendation.`;
}

/**
 * Ideation discovery prompt.
 */
function buildDiscoverPrompt(action, niche, audience) {
  if (action === 'ideas') return `Generate 5 non-cliche content ideas for Niche: ${niche}, Audience: ${audience}. Output as a numbered list with catchy Titles and brief logic.`;
  if (action === 'trends') return `Identify 3 major macro trends for Niche: ${niche}, Audience: ${audience}. Explain why they matter now. Bullet list.`;
  if (action === 'weekly_plan') return `Build a Mon-Sun content calendar for Niche: ${niche}, Audience: ${audience}. 1 post per day, precise formats and title ideas.`;
}

/**
 * Repurposing engine prompt.
 */
function buildRepurposePrompt(mode, sourceMaterial, platform = 'LinkedIn') {
  if (mode === 'blog_to_post') return `${PERSONA} Task: Rewrite this blog into a single highly-engaging ${platform} post under 200 words. Source:\n${sourceMaterial}`;
  if (mode === 'tweet_to_thread') return `${PERSONA} Task: Expand this thought into a structured ${platform} narrative framework (Story, Lesson, Conclusion). Source:\n${sourceMaterial}`;
  if (mode === 'blog_to_carousel') return `${PERSONA} Task: Summarize to exactly 5 slides for a ${platform} carousel. JSON array of 'title' and 'body'. No markdown wrappers. Source:\n${sourceMaterial}`;
  if (mode === 'spawner') return `${PERSONA} Task: Spawn 3 different ${platform} posts (Vulnerable Story, How-To, Contrarian). separate with ---. Source:\n${sourceMaterial}`;
}

/**
 * Mega prompt for Campaign Ideation
 */
function buildCampaignIdeationPrompt(safeConfig) {
  return `You are a Senior Brand Strategist & Creative Planner.
Task: Generate campaign ideas
Input Configuration: ${JSON.stringify(safeConfig, null, 2)}
Rules: Output EXACTLY 2 Themes. EXACTLY 2 Pillars per Theme. EXACTLY 5 Ideas per Pillar. EXACTLY 4 Sample Images total.
YOUR ENTIRE RESPONSE MUST BE A STRICTLY VALID JSON OBJECT. Do not wrap in markdown \`\`\`json. Format matches:
{ "themes": [ { "title": "name", "rationale": "why", "pillars": [ { "title": "name", "description": "desc", "ideas": [ { "idea_summary": "summary", "suggested_visual": { "description": "vis", "recommended_dimensions": "1080x1080" }, "recommended_channels": ["instagram"] } ] } ] } ] }`;
}

/**
 * Mega prompt for Campaign Asset Generation including Instagram, LinkedIn, and Meta Ads.
 */
function buildCampaignAssetPrompt(channel, postFormat, dimensions, idea, config) {
  let megaPromptTemplate = '';

  if (channel === 'instagram') {
    megaPromptTemplate = JSON.stringify({
      task: "Generate Instagram campaign images (Step 3: Image + Caption Generation)",
      persona: { role: "Brand-aligned Creative Director", priorities: ["Strict brand alignment", "Lifestyle storytelling"] },
      inputs: {
        user_selection: { chosen_idea_id: idea.idea_summary, post_format: postFormat, carousel_frames: 3 },
        campaign_config: { campaign_name: config.campaign_name, campaign_goal: config.campaign_goal, campaign_type: config.campaign_type, product_info: config.product_info, channel_config: { channel: "instagram", dimensions, image_type: config.image_type, post_format: postFormat } },
        brand_kit: config.brand_kit,
        visual_inputs: { scene_context: idea.suggested_visual?.description || "Product Feature" }
      },
      rules: { caption_length_rule: "20-80 words single, 30-120 carousel. No hashtags unless asked." },
      outputs: {
        generation_prompt: { channel: "instagram", post_format: postFormat, dimensions, scene_context: "", carousel_sequence: [{ frame: 1, focus: "", visual_description: "" }] },
        caption: { text: "Generated strictly brand-aligned caption here" }
      }
    }, null, 2);
  } else if (channel === 'linkedin') {
    megaPromptTemplate = JSON.stringify({
      task: "Generate LinkedIn campaign images",
      persona: { role: "Omnichannel Creative Strategist" },
      inputs: {
        user_selection: { chosen_idea_id: idea.idea_summary, post_format: postFormat },
        campaign_config: { campaign_name: config.campaign_name, product_info: config.product_info },
        brand_kit: config.brand_kit
      },
      rules: { linkedin_image_rules: "Professional tone." },
      outputs: {
        generation_prompt: { channel: "linkedin", dimensions: "1200x627", scene_context: "" },
        copy: { text: "Generated professional LinkedIn copy" }
      }
    }, null, 2);
  } else {
    megaPromptTemplate = JSON.stringify({
      task: "Generate Meta Ads campaign creatives",
      persona: { role: "Performance Marketing Creative Strategist" },
      inputs: {
        user_selection: { chosen_idea_id: idea.idea_summary, ad_format: postFormat },
        campaign_config: { campaign_name: config.campaign_name, product_info: config.product_info, channel_config: { dimensions, image_type: config.image_type } },
      },
      rules: { performance_rule: "Strict Meta alignment" },
      outputs: {
        generation_prompt: { channel: "meta_ads", dimensions, scene_context: "" },
        ad_copy_variants: [{ primary_text: { short: "", medium: "", long: "" }, headline: "", description: "", CTA_button: "" }],
        performance_rationale: { expected_metrics: { CTR: "", ROAS: "", CAC: "" }, best_recommendation: { starting_creative: "", priority_audience: "" } }
      }
    }, null, 2);
  }

  return `You must fulfill the target task based on this strict JSON architecture. 
Execute the task and output ONLY A VALID JSON MATCHING THE "outputs" SCHEMA EXACTLY.
Do not wrap your response in markdown \`\`\`json. 
Input Context & Schema:
${megaPromptTemplate}`;
}

/**
 * Trend Analyzer logic.
 */
function buildTrendPrompt(startDate, endDate, url) {
  const dateRangeText = `${startDate} to ${endDate}`;
  return `You are a senior omnichannel marketer and brand manager with 25+ years of experience, specialized in deep market intelligence and trend forecasting across global landscapes.

### 🧩 Brand Context
- Infer brand_name, category, positioning, and target audience from ${url}
- Identify 3–5 direct competitors dynamically
- Infer 3–5 content_pillars based on brand positioning
- Use this inferred context consistently across all insights

### 🧠 Analysis Depth Rules
- Go beyond surface-level observations
- Prioritize patterns, shifts, anomalies, and outliers
- Quantify insights wherever possible (%, growth rates, comparisons)
- Distinguish between correlation vs causation where applicable

### 📊 Insight Quality Standard
Each insight must be:
- Specific (no generic statements)
- Evidence-backed (linked to source)
- Actionable (implies a decision, opportunity, or risk)

### 🎯 Core Research Goals (Categories)
For each category:
- Clearly define the scope of analysis (what to evaluate)
- Ensure outputs align with a strategic outcome (why this matters for the brand)

1. **Industry & Market Intelligence**: Map the macro landscape. Integrate signals from **Google Trends, WGSN, and PitchBook**. Include sector definition, macro trends, geographic signals, and forward-looking opportunities.

2. **Social & Competitive Intelligence**: Benchmark activity across Instagram, TikTok, YouTube, LinkedIn, Facebook, and Pinterest.
- Distinguish between paid vs organic content
- Analyze posting cadence and consistency
- Estimate follower growth velocity and engagement quality
- Evaluate comment depth and sentiment (not just likes)

3. **Content Strategy & Trend Analysis**:
- Identify high-performing formats and publishing patterns
- Generate content ideas aligned to inferred content_pillars
- Each idea must include: hook/title, short description (2–3 lines), format, and CTA
- Detect viral formats, memes, storytelling styles
- Track trending audio and classify trends as: emerging, peaking, or declining
- Analyze cross-platform diffusion patterns

4. **Influencer & Creator Intelligence**:
- Recommend influencers with:
  - Platform
  - Follower range
  - Engagement rate estimate
  - Niche/category
  - Relevance to brand
- Identify emerging creators with rapid growth signals

5. **Product Intelligence**:
- Track recent innovations and launches
- Identify whitespace opportunities
- Include sentiment breakdown on product attributes (price, quality, usability, accessibility)

6. **Consumer Insights & Risk Mapping**:
- Analyze sentiment, discourse, and behavioral signals
- Detect unmet needs and frustration clusters
- Segment insights by audience cohorts (Gen Z, Millennials, Tier 1/2/3)
- Identify reputational, regulatory, or cultural risks

7. **Event & Moment Intelligence**:
- Identify relevant events, campaigns, and cultural moments
- Map events to content opportunities
- Tag each event with thematic relevance (e.g., gifting, wellness, luxury)

8. **Content Placement & Media Opportunities**:
- Identify high-visibility media, newsletters, and creator ecosystems
- Recommend partnerships, co-branded opportunities, and distribution channels
- Track emerging formats (podcasts, Substacks, creator collectives)

### 🧾 Output Format: STRICTLY return ONLY a valid JSON list (no text before or after), where each item is a dictionary.

[
  {
    "feature_category": "Industry & Market Intelligence",
    "sub_feature": "Executive Summary & Industry Pulse",
    "insight_summary": ["High-level summary of research findings for ${url} from ${dateRangeText}.", "Top-tier macro signal 1", "Top-tier macro signal 2"],
    "source_citation": ["Primary Source URL"],
    "data_confidence": "high",
    "data_status": "Updated",
    "source_type": "platform_data"
  },
  { "feature_category": "Industry & Market Intelligence", "sub_feature": "Sector, Geography, Trend Signals", "insight_summary": ["Insight"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Industry & Market Intelligence", "sub_feature": "Geo-signals & Emerging Risks", "insight_summary": ["Insight"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },

  { "feature_category": "Social & Competitive Intelligence", "sub_feature": "Official Profiles & Platform Activity", "insight_summary": ["Analysis"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Social & Competitive Intelligence", "sub_feature": "Campaign Highlights", "insight_summary": ["Campaign detail"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Social & Competitive Intelligence", "sub_feature": "Hashtag/Keyword Insights", "insight_summary": ["Top hashtags"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Social & Competitive Intelligence", "sub_feature": "Engagement Rate Comparison", "insight_summary": ["Carousel vs video stats"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Social & Competitive Intelligence", "sub_feature": "Competitor Activity & Benchmarking", "insight_summary": ["Competitor strategy"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Social & Competitive Intelligence", "sub_feature": "Mentions & Media Presence", "insight_summary": ["Press mention"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },

  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Format Benchmarking", "insight_summary": ["Format insight"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Content Ideas Generator", "insight_summary": ["Idea 1", "Idea 2", "Idea 3"], "source_citation": ["AI Generated"], "data_confidence": "high", "data_status": "Updated", "source_type": "brand_assets" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Trending Hashtags (Cross-platform)", "insight_summary": ["#Trend"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Trending Audio & Music Clips", "insight_summary": ["Audio name"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Challenge & Format Trends", "insight_summary": ["Challenge info"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Look Filters & AR/AI Effects", "insight_summary": ["Filter info"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Product/Category Trend Spikes", "insight_summary": ["Spike info"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Viral Meme Themes/Formats", "insight_summary": ["Meme theme"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Cross-platform Diffusion Patterns", "insight_summary": ["Trend migration"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },

  { "feature_category": "Influencer & Creator Intelligence", "sub_feature": "Influencer Recommendations", "insight_summary": ["Influencer 1", "Influencer 2"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "influencer_tools" },
  { "feature_category": "Influencer & Creator Intelligence", "sub_feature": "Emerging Influencer Detection", "insight_summary": ["Rising star info"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "influencer_tools" },

  { "feature_category": "Product Intelligence", "sub_feature": "Innovation Highlights", "insight_summary": ["Launch info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Product Intelligence", "sub_feature": "Product Gap Analysis", "insight_summary": ["Whitespace opportunity"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "community_forums" },

  { "feature_category": "Consumer Insights & Risk Mapping", "sub_feature": "Sentiment & Behavioral Patterns", "insight_summary": ["Sentiment info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "community_forums" },
  { "feature_category": "Consumer Insights & Risk Mapping", "sub_feature": "Market Opportunities & Risks", "insight_summary": ["Risk/Opportunity info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },

  { "feature_category": "Event & Moment Intelligence", "sub_feature": "Industry Conferences & Expos", "insight_summary": ["Conference info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Event & Moment Intelligence", "sub_feature": "Creator Fests & Influencer Summits", "insight_summary": ["Summit info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Event & Moment Intelligence", "sub_feature": "Awards & Recognition Events", "insight_summary": ["Award info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Event & Moment Intelligence", "sub_feature": "Webinars & Panel Discussions", "insight_summary": ["Webinar info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Event & Moment Intelligence", "sub_feature": "Hackathons & Innovation Challenges", "insight_summary": ["Hackathon info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Event & Moment Intelligence", "sub_feature": "Brand Campaign Launches (Offline)", "insight_summary": ["Activation info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Event & Moment Intelligence", "sub_feature": "Brand Participation & Absence", "insight_summary": ["Participation status"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },

  { "feature_category": "Content Placement & Media Opportunities", "sub_feature": "Influencer Partnership Openings", "insight_summary": ["Opening info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "influencer_tools" },
  { "feature_category": "Content Placement & Media Opportunities", "sub_feature": "Editorial Feature Avenues", "insight_summary": ["Magazine info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Content Placement & Media Opportunities", "sub_feature": "Blog Outreach & Guest Content Pitches", "insight_summary": ["Blog info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Content Placement & Media Opportunities", "sub_feature": "Newsletter Mentions & Gifting Inclusions", "insight_summary": ["Newsletter info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Content Placement & Media Opportunities", "sub_feature": "Co-branded Content Possibilities", "insight_summary": ["Partner info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Content Placement & Media Opportunities", "sub_feature": "Affiliate or Creator Collectives", "insight_summary": ["Collective info"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Content Placement & Media Opportunities", "sub_feature": "Content Format Suggestions by Channel", "insight_summary": ["Platform suggestion"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" }
]

### 📌 Rules & Instructions
- Return ALL 8 categories. Return exactly 37-38 items.
- insight_summary MUST be a JSON array of 3-6 high-quality, distinct insights.
- Strictly prioritize signals within ${dateRangeText}. Older data can be used only for context.
- Use only credible and verifiable sources. Always return full URLs.
- Avoid speculation or unsupported claims.

### ⚠️ Missing Data Handling
If no data is found:
- data_status: "Missing"
- insight_summary: ["No data was surfaced for this category within the selected date range"]

### 📌 Final Output Rule
Before returning JSON, output only: "CONFIRMED: ALL ENTRIES PRESENT"
Then output the pure JSON list.`;
}
/**
 * Feed Scraping prompt.
 */
function buildFeedScraperPrompt(sourceUrl) {
  return `Simulate scraping the latest post from this Instagram/Web handle: ${sourceUrl}. Generate exactly 1 highly realistic mock post for this brand/handle. Provide output strictly in JSON format as follows without markdown tags: {"author_name": "Brand Name", "handle": "brand_handle", "avatar": "https://placehold.co/100x100/333/fff?text=AV", "image": "https://placehold.co/1080x1080/eee/999?text=Post+Image", "caption": "Simulated caption here...", "likes": "12,345", "comments": "234", "impressions": "45K", "timestamp": "2h"}`;
}

export {
  buildDraftPrompt,
  buildEditorPrompt,
  buildIterationPrompt,
  buildRewritePrompt,
  buildVisualsPrompt,
  buildEngagementPrompt,
  buildHookIntelligencePrompt,
  buildHookRefinementPrompt,
  buildAnglesBuilderPrompt,
  buildBodyBuilderPrompt,
  buildPolishBuilderPrompt,
  buildPolishBuilderPrompt as buildCTAHashtagsPrompt,
  buildScheduleInsightPrompt,
  buildDiscoverPrompt,
  buildHookRefinementPrompt as buildHookRefinementPromptAlias,
  buildDiscoverPrompt as buildDiscoverPromptAlias,
  buildScheduleInsightPrompt as buildScheduleInsightPromptAlias,
  buildRepurposePrompt,
  buildCampaignIdeationPrompt,
  buildCampaignAssetPrompt,
  buildTrendPrompt,
  buildFeedScraperPrompt
};
