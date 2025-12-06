'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Sparkles } from 'lucide-react'

interface EntryEditorProps {
  onEntrySaved: () => void
}

export function EntryEditor({ onEntrySaved }: EntryEditorProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string | null>(null)

  const supabase = createClient()

  const handleSave = async () => {
    if (!content.trim()) return

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
        console.error('API error:', await response.text())
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
        placeholder="What's on your mind today?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[200px] text-lg"
      />

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