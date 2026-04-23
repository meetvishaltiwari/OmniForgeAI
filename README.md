# OmniForge AI

**OmniForge AI** is a premium, data-driven content and design operating system powered by Google Gemini. It allows you to **Forge, Analyze, and Scale Content Across Every Channel** with unprecedented speed and precision.

Built with an agentic workflow at its core, OmniForge AI doesn't just generate text; it acts as a strategic "Editor Agent" that drafts, refines, and optimizes content for maximum performance across LinkedIn, X (Twitter), Instagram, Meta Ads, and more.

---

## 🌟 Key Features

### 1. 🧙‍♂️ Campaign Wizard (Agentic Workflow)
Generate high-fidelity marketing campaigns in seconds.
- **Vision-Powered Analysis**: Upload a product image, and the AI automatically extracts product attributes, visual style, and value propositions.
- **Multi-Channel Ideation**: Generates cohesive campaign themes, pillars, and ideas across multiple social channels.
- **One-Click Asset Generation**: Creates tailored ad copy and visual descriptions optimized for each platform's unique algorithm.

### 2. 📊 High-Fidelity Trend Analyser
Go beyond surface-level metrics with our 37-node deep market intelligence engine.
- **8 Core Research Goals**: Industry Pulse, Social Intelligence, Content Strategy, Influencer Mapping, Product Gaps, Consumer Sentiment, Moment Intelligence, and Media Placement.
- **Data-Driven Insights**: Processes complex datasets into actionable intelligence with confidence scoring and source citations.
- **Dynamic Visualizations**: Interactive dashboards that map trends over time.

### 3. ✍️ Structured Post Builder
A linear, guided workflow for creating the perfect social post.
- **Angle Generator**: Suggests 5+ psychological angles (Contrarian, Story, Framework, etc.) for any topic.
- **Smart Body Drafting**: Generates context-rich body copy using "Evidence-Based" or "Curiosity-Gap" structures.
- **CTA & Hashtag Polishing**: Suggests high-converting CTAs and niche-specific hashtags.

### 4. 🎨 Visual Studio & Carousel Engine
Create stunning visuals without opening a design tool.
- **Carousel Generator**: Break down complex topics into multi-slide educational carousels.
- **Mermaid.js Infographics**: Instantly generate professional diagrams and flowcharts for technical content.
- **Quote Cards**: Extract and format viral quotes for high-impact social sharing.

### 5. 🪝 Hook Intelligence Engine
Stop the scroll with 10+ scientifically backed hook styles.
- **Hook Variations**: Generate "Pattern Interrupt," "Pain Amplifier," and "Curiosity Loop" hooks.
- **Real-time Refinement**: Iteratively improve hooks for better "scroll-stop" scores.

### 6. ♻️ Content Repurposing Engine
Atomize your content effortlessly.
- **Blog to Carousel**: Turn long-form articles into punchy slides.
- **Tweet to Narrative**: Expand a single thought into a deep LinkedIn story.
- **Platform Adaptation**: Reformat content for different channels while maintaining core messaging.

### 7. 🛡️ Brand Kit Manager
Maintain perfect brand consistency across every generation.
- **Logo & Asset Fetching**: Automated fetching of brand assets via Brandfetch.
- **Style Persistence**: Save color palettes, typography, tone of voice, and audience personas.
- **AI Control**: Fine-tune the AI's creative boundaries to match your brand's unique identity.

---

## 🏗️ Architecture & Technology Stack

- **Core**: React 19 + Vite (Frontend) | Node.js + Express (Backend)
- **AI Engine**: Google Gemini 1.5 Pro & Flash (via `@google/generative-ai`)
- **Database**: SQLite3 for persistent campaigns, activity logs, and brand kits.
- **Styling**: Tailwind CSS + Vanilla CSS for premium, responsive UI.
- **Agentic Logic**: A "Generate-with-Fallback" server strategy ensures reliability by chaining multiple Gemini models to mitigate quota limitations.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- A Google Gemini API Key

### 2. Setup Environment
Create a `.env` file in the root:
```env
GEMINI_API_KEY="your-gemini-api-key"
BRANDFETCH_API_KEY="your-brandfetch-api-key" # Optional for Brand Kit fetching
```

### 3. Installation
```bash
npm install
```

### 4. Development Mode
```bash
npm run dev
```
This starts **both** the backend Express server (port 3001) and the frontend Vite server (port 5173) concurrently.

---

## 🧠 Agentic "Editor" Workflow
OmniForge AI uses a multi-pass agentic pattern:
1. **The Architect**: Analyzes inputs and builds a structural skeleton.
2. **The Draftsman**: Generates raw creative content.
3. **The Editor**: A separate LLM pass that acts as a strict critic, removing AI cliches, improving flow, and enforcing platform-specific constraints.

---

*Forge, Analyze, and Scale Content Across Every Channel.*
*Powered by Google Antigravity & the Gemini Model Family.*
