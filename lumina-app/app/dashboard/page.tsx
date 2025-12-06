'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EntryEditor } from '@/components/journal/EntryEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import { BarChart3, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface JournalEntry {
  id: string
  created_at: string
  content: string
  sentiment?: {
    sentiment?: {
      label: string
      score: number
    }
    themes?: string[]
  }
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const loadEntries = async () => {
      const { data } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setEntries(data || [])
      setLoading(false)
    }

    loadEntries()
  }, [supabase])

  const handleEntrySaved = async () => {
    const { data } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    setEntries(data || [])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Lumina Journal ✨</h1>
          <div className="flex gap-2">
            <Link href="/dashboard/insights">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <EntryEditor onEntrySaved={handleEntrySaved} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Entries</h2>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : entries.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No entries yet. Write your first one above!</p>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), 'PPP p')}
                    </CardTitle>
                    {entry.sentiment?.sentiment?.label && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        entry.sentiment.sentiment.label === 'positive' 
                          ? 'bg-green-100 text-green-800' 
                          : entry.sentiment.sentiment.label === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.sentiment.sentiment.label}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{entry.content}</p>

                  {entry.sentiment?.themes && entry.sentiment.themes.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {entry.sentiment.themes.map((theme: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}