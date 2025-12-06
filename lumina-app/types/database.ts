export type JournalEntry = {
  id: string;
  user_id: string;
  content: string;
  mood_score: number;
  sentiment_label: 'Positive' | 'Neutral' | 'Negative';
  ai_reflection: string;
  created_at: string;
  themes?: string[];
};