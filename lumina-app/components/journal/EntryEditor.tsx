'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { moderateContent, isLikelySpam } from '@/lib/moderation'

interface EntryEditorProps {
  onEntrySaved: () => void
}

export function EntryEditor({ onEntrySaved }: EntryEditorProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string | null>(null)
  const [moderationError, setModerationError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSave = async () => {
    if (!content.trim()) return

    // Clear any previous moderation errors
    setModerationError(null)

    // Check for spam
    if (isLikelySpam(content)) {
      setModerationError('This entry appears to be a test. Please write a meaningful journal entry.')
      return
    }

    // Moderate content before processing
    const moderationResult = moderateContent(content)

    if (!moderationResult.isAppropriate) {
      setModerationError(moderationResult.reason || 'This content is not appropriate for journaling.')
      return
    }

    setLoading(true)
    try {
      console.log('1. Fetching recent entries...')
      const { data: recentEntries, error: fetchError } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (fetchError) {
        console.error('Error fetching entries:', fetchError)
      }

      console.log('2. Calling AI API...')
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, recentEntries }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API rejected content:', errorData)

        // Show the server's moderation error
        if (errorData.error) {
          setModerationError(errorData.error)
          setLoading(false)
          return
        }

        throw new Error('API call failed')
      }

      const { analysis, followUpPrompt } = await response.json()
      console.log('3. AI analysis:', analysis)

      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User error:', userError)
        throw new Error('Not authenticated')
      }

      console.log('4. User ID:', user.id)
      console.log('5. Saving to database...')

      const insertData = {
        content,
        sentiment: analysis,
        user_id: user.id
      }

      console.log('6. Data being inserted:', insertData)

      const { data: savedEntry, error: insertError } = await supabase
        .from('entries')
        .insert(insertData)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      console.log('7. Entry saved!', savedEntry)

      setAiPrompt(followUpPrompt)
      setContent('')
      setModerationError(null)
      onEntrySaved()
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save entry: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="What's on your mind today? Share your thoughts, feelings, or experiences..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          // Clear moderation error when user starts typing
          if (moderationError) setModerationError(null)
        }}
        className="min-h-[200px] text-lg"
      />

      {moderationError && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Content Not Appropriate</p>
              <p className="text-sm text-red-800 mt-1">{moderationError}</p>
            </div>
          </div>
        </Card>
      )}

      {aiPrompt && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">{aiPrompt}</p>
          </div>
        </Card>
      )}

      <Button onClick={handleSave} disabled={loading || !content.trim()}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Entry
      </Button>
    </div>
  )
}