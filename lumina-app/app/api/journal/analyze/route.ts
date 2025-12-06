import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, recentEntries } = await request.json()

    const analysisPrompt = `Analyze this journal entry for sentiment and themes. Return JSON only.

    Entry: "${content}"
    
    Return format:
    {
      "sentiment": {
        "score": <-1 to 1>,
        "label": "positive|neutral|negative"
      },
      "themes": ["theme1", "theme2"],
      "emotions": ["emotion1", "emotion2"]
    }`

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
    })

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}')

    const promptGeneration = `Based on this journal entry and recent context, generate ONE empathetic follow-up question.

    Current entry: "${content}"
    Recent themes: ${recentEntries?.map((e: any) => e.sentiment?.themes).flat().join(', ') || 'none'}
    
    Generate a thoughtful question that encourages deeper reflection. Be warm and conversational.`

    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: promptGeneration }],
      temperature: 0.7,
    })

    const followUpPrompt = promptResponse.choices[0].message.content

    return NextResponse.json({
      analysis,
      followUpPrompt
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze entry' },
      { status: 500 }
    )
  }
}