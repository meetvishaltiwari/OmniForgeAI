/**
 * Prompt library for OmniForge AI.
 * Focus: High-performance content, scroll-stopping hooks, and deep market intel.
 */

function buildDraftPrompt(config) {
  return `Write a high-converting ${config.platform || 'LinkedIn'} post about ${config.topic}.
Target Audience: ${config.audience}
Tone: ${config.tone}
Hook Style: ${config.hookStyle}
Format: ${config.formatTemplate}
Keywords: ${config.keywords}

Strict Rules:
- No AI fluff (delve, tapestry, landscape).
- Use a punchy opening.
- Scannable whitespace.
- Strong ending CTA.`;
}

function buildIterationPrompt(draft, instruction) {
  return `Rewrite the following draft based on this instruction: "${instruction}"
Current Draft:
${draft}

Rules:
- Keep the original core message.
- Improve flow and punchiness.`;
}

function buildRewritePrompt(draft, instruction, platform) {
  return `Rewrite this for ${platform}. Instruction: ${instruction}
Content: ${draft}`;
}

function buildVisualsPrompt(type, input, platform) {
  if (type === 'infographic') {
    return `Generate a Mermaid.js diagram code based on: ${input}. Target: ${platform}. Output pure Mermaid code only.`;
  }
  if (type === 'carousel') {
    return `Create a 5-slide carousel structure for ${platform} based on: ${input}. Return JSON: [{"title": "Slide 1", "body": "text"}, ...]`;
  }
  return `Create a viral quote for ${platform} based on: ${input}. Return JSON: {"quote": "...", "author": "..."}`;
}

function buildEngagementPrompt(type, content, tone, niche, platform) {
  return `Platform: ${platform}. Type: ${type}. Tone: ${tone}. Niche: ${niche}.
Content context: ${content}
Generate a high-value response that drives conversation.`;
}

function buildHookIntelligencePrompt(topic, niche, audience, goal, platform) {
  return `Generate 5 viral hooks for ${platform} about ${topic}.
Target: ${audience} in ${niche}. Goal: ${goal}.
Return JSON: [{"hook": "...", "format": "...", "trigger": "...", "intent": "...", "scores": {"scrollStop": 9, "curiosity": 8, "clarity": 7}, "variations": {"short": "...", "aggressive": "...", "curiosity_max": "..."}}]`;
}

function buildDiscoverPrompt(topic, niche, audience) {
  return `Generate 5 viral content ideas/topics for: ${topic} targeting ${audience} in ${niche}.
Return JSON: [{"topic": "...", "angle": "...", "reasoning": "..."}]`;
}

function buildRepurposePrompt(mode, sourceMaterial, platform) {
  return `Mode: ${mode}. Target: ${platform}. 
Source: ${sourceMaterial}
Atomize this content. Return JSON representation of the new format.`;
}

function buildCampaignIdeationPrompt(config) {
  return `Generate a campaign strategy for ${config.campaign_name}.
Product: ${config.product_info.name}. Value: ${config.product_info.value_prop}.
ICP: ${config.product_info.ideal_customer}. Strategy: ${config.strategy}.
Return JSON: [{"campaign_angle": "...", "platform_ideas": [{"platform": "...", "ideas": [{"idea_summary": "...", "recommended_channels": ["..."]}]}]}]`;
}

function buildCampaignAssetPrompt(config, idea, channel) {
  if (channel === 'meta_ads') {
    return `Generate a Meta Ads Creative Brief JSON. Idea: ${idea.idea_summary}. 
Include: ad_copy_variants (short, medium, long), headline, performance_rationale (summary, why_this_image_works, expected_metrics {CTR, ROAS, CAC, CPM, CVR, CPC}, audience_recommendations {personas, interest_clusters, age_groups, regions}), best_recommendation (starting_creative, budget_allocation, execution_note).`;
  }
  return `Generate high-performing copy for ${channel}. Idea: ${idea.idea_summary}.`;
}

function buildTrendPrompt(url, startDate, endDate) {
  const dateRangeText = startDate && endDate ? `between ${startDate} and ${endDate}` : "within the last 3 months";
  return `Analyze the market/domain: ${url} ${dateRangeText}.
Aggregrate intelligence for 8 core vectors.
Return a JSON array of objects with this schema:
[
  { "feature_category": "Market Sentiment", "sub_feature": "Consumer Pain Points", "insight_summary": ["Insight 1", "Insight 2"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "social_media" },
  { "feature_category": "Market Sentiment", "sub_feature": "Competitor Sentiment Analysis", "insight_summary": ["Insight 1"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Valid", "source_type": "reviews" },
  { "feature_category": "Market Sentiment", "sub_feature": "Brand Perception & Reputation", "insight_summary": ["Insight"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "news_media" },
  { "feature_category": "Market Sentiment", "sub_feature": "Shifting Customer Needs", "insight_summary": ["Insight"], "source_citation": ["URL"], "data_confidence": "medium", "data_status": "Partial", "source_type": "community_forums" },

  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "High-performing Content Formats", "insight_summary": ["Carousel is winning"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Viral Topic Clusters", "insight_summary": ["Topic 1", "Topic 2"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Emerging Visual Styles", "insight_summary": ["Neon minimalism"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Engagement Triggers/Mechanisms", "insight_summary": ["Polls are high"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
  { "feature_category": "Content Strategy & Trend Analysis", "sub_feature": "Niche-Specific Hashtag Efficacy", "insight_summary": ["#tech trending"], "source_citation": ["URL"], "data_confidence": "high", "data_status": "Updated", "source_type": "platform_data" },
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
  buildRepurposePrompt,
  buildCampaignIdeationPrompt,
  buildCampaignAssetPrompt,
  buildTrendPrompt,
  buildFeedScraperPrompt
};
