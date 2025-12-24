import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { moderateContent, isLikelySpam } from '@/lib/moderation'

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

    // Layer 1: Spam detection
    if (isLikelySpam(content)) {
      console.log('BLOCKED: Spam detected')
      return NextResponse.json(
        { error: 'Entry appears to be spam or a test. Please write a meaningful journal entry.' },
        { status: 400 }
      )
    }

    // Layer 2: Pattern-based moderation
    const moderationResult = moderateContent(content)

    if (!moderationResult.isAppropriate) {
      console.log('BLOCKED: Pattern moderation failed -', moderationResult.category)
      return NextResponse.json(
        {
          error: moderationResult.reason || 'Content not appropriate for journaling',
          category: moderationResult.category
        },
        { status: 400 }
      )
    }

    // Layer 3: OpenAI Moderation API (free, highly effective)
    try {
      const openaiModeration = await openai.moderations.create({
        input: content,
      })

      const flagged = openaiModeration.results[0].flagged
      const categories = openaiModeration.results[0].categories

      if (flagged) {
        console.log('BLOCKED: OpenAI moderation flagged -', categories)

        // Provide specific feedback based on category
        let specificReason = 'This content was flagged as potentially harmful. '

        if (categories.violence || categories['violence/graphic']) {
          specificReason += 'Lumina Journal is a safe space for reflection, not for discussing violent acts.'
        } else if (categories['self-harm']) {
          specificReason += 'If you are experiencing thoughts of self-harm, please reach out to a mental health professional or crisis helpline immediately. National Suicide Prevention Lifeline: 988'
        } else if (categories.hate) {
          specificReason += 'Please keep your entries respectful and focused on personal growth.'
        } else {
          specificReason += 'Please focus on personal reflection and emotional wellbeing.'
        }

        return NextResponse.json(
          {
            error: specificReason,
            category: 'harmful'
          },
          { status: 400 }
        )
      }

      console.log('PASSED: All moderation checks')
    } catch (moderationError) {
      console.error('OpenAI moderation error (continuing):', moderationError)
      // Continue even if OpenAI moderation fails - we have other layers
    }

    // Add instruction to AI to stay focused on journaling
    const analysisPrompt = `You are a compassionate journaling companion. Analyze this journal entry for sentiment and themes.

    IMPORTANT: This is a personal journal entry. Focus ONLY on the emotional and reflective aspects. Do not provide advice on technical tasks, recipes, or general knowledge questions.
    
    Entry: "${content}"
    
    Return JSON only:
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

    // Generate empathetic follow-up focused on reflection
    const promptGeneration = `You are a supportive journaling companion. Based on this journal entry, generate ONE empathetic follow-up question that encourages deeper self-reflection.

    Current entry: "${content}"
    Recent themes: ${recentEntries?.map((e: any) => e.sentiment?.themes).flat().join(', ') || 'none'}
    
    IMPORTANT: 
    - Keep the question focused on their EMOTIONS and PERSONAL EXPERIENCES
    - Encourage introspection and self-discovery
    - Be warm, non-judgmental, and supportive
    - Do NOT provide advice, solutions, or instructions
    - Do NOT answer questions or provide information
    
    Generate a thoughtful question (one sentence, conversational tone).`

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