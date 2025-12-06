# Lumina Journal

An AI-powered journaling companion that helps users overcome blank page anxiety and discover patterns in their emotional journey.

## Problem Statement

Many people struggle to maintain a consistent journaling practice due to:
- "Blank page" anxiety - not knowing what to write
- Difficulty identifying meaningful patterns in thoughts and emotions
- Lack of personalized guidance and reflection prompts

## Solution

Lumina Journal uses AI to provide:
- **Dynamic, empathetic prompts** based on recent entries
- **Sentiment analysis** to track emotional trends over time
- **Automatic theme extraction** to identify recurring topics
- **Privacy-first design** with secure data isolation

## Features

- **Secure Authentication** - User accounts with Supabase Auth
- **AI Sentiment Analysis** - Real-time emotional scoring using OpenAI GPT-3.5
- **Context-Aware Prompts** - Personalized follow-up questions for deeper reflection
- **Insights Dashboard** - Visual mood trends and theme tracking
- **Theme Extraction** - Automatic categorization of journal topics
- **Privacy First** - Row Level Security ensures data isolation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Authentication)
- **AI**: OpenAI GPT-3.5 Turbo
- **Visualization**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/lumina-journal.git
cd lumina-journal
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Set up database
- Run the SQL schema in Supabase SQL Editor (see `/supabase/schema.sql`)

5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign Up** - Create an account with email and password
2. **Write Entry** - Share your thoughts in the journal editor
3. **AI Analysis** - Get instant sentiment analysis and follow-up prompts
4. **View Insights** - Track your emotional trends and recurring themes

## Security & Privacy

- Row Level Security (RLS) policies ensure users only access their own data
- All authentication handled by Supabase Auth
- No third-party analytics or tracking
- Data encrypted at rest and in transit

## AI Implementation

- **Sentiment Analysis**: Analyzes text to determine emotional tone (-1 to 1 scale)
- **Theme Extraction**: Identifies key topics like "work", "family", "stress"
- **Contextual Prompts**: Generates personalized questions based on entry content and history
- **Responsible AI**: Non-judgmental tone, transparent analysis, privacy-focused

## Demo Data

Sample entries included for testing:
- Positive sentiment with achievement themes
- Negative sentiment with stress themes  
- Neutral reflective entries
- Mixed emotions with growth themes

## Future Enhancements

- Weekly AI-generated summaries
- Entry search and filtering
- Export data (JSON/PDF)
- Mobile app
- Voice journaling
- Streak tracking

## Team

Built for Palo Alto Networks FY26 Hackathon by Calvin Ssendawula.

## License

MIT License

## Acknowledgments

- OpenAI for GPT-3.5 API
- Supabase for backend infrastructure
- shadcn/ui for component library