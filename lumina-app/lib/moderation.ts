/**
 * Content moderation service for Lumina Journal
 * Ensures entries are appropriate for personal reflection
 */

export interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  category?: 'harmful' | 'illegal' | 'off-topic' | 'spam';
}

const HARMFUL_PATTERNS = [
  // Violence & weapons
  /\b(make|build|create|want|get)\s+(a\s+)?(bomb|explosive|weapon)/gi,
  /\b(bomb|explosive|weapon|grenade|missile)\b/gi,
  /\bhow\s+to\s+(kill|murder|hurt|harm)/gi,

  // Self-harm
  /\b(want|going|plan)\s+to\s+(kill|hurt|harm)\s+(myself|me)\b/gi,

  // Illegal activities
  /\bhow\s+to\s+(hack|steal|rob|fraud|scam|break into)/gi,
  /\b(buy|sell|get|obtain)\s+(illegal\s+)?(drugs|cocaine|heroin|meth|fentanyl)/gi,

  // Explicit abuse
  /\b(abuse|molest|assault|rape|trafficking)\b/gi,
];

const OFF_TOPIC_PATTERNS = [
  // Technical requests
  /^(write|create|generate|make)\s+(code|program|script|function|api)/i,
  /^(help me|can you)\s+(code|program|debug|fix)/i,

  // Questions directed at the AI/system (not self-reflection)
  /^(are|is|do|did|can|could|would|will)\s+you\b/i,
  /^(what|how|why|when|where)\s+(are|is|do|did|can|would|will)\s+you\b/i,

  // Questions about facts, people, places (not personal reflection)
  /^(what|where|when|who|how)\s+(is|are|was|were|did|does|do)\s+(?!i|me|my|we|our)/i,
  /^(where|what|who)\s+(?!am i|are my|is my)/i,

  // General AI assistant requests
  /^(tell me about|explain)\s+(?!my|how i|why i|what i)/i,
  /^(calculate|solve|compute|find out|look up)/i,

  // Recipe/instruction requests
  /^(recipe|how to (cook|bake|make))\s+(?!.*?(feel|cope|deal|manage))/i,

  // Commands to AI
  /^(search|find|show me|give me|list|compare)/i,
];

const JOURNALING_KEYWORDS = [
  'feel', 'feeling', 'felt', 'emotion', 'thought', 'thinking',
  'today', 'yesterday', 'lately', 'recently',
  'i', 'me', 'my', 'myself',
  'grateful', 'happy', 'sad', 'angry', 'anxious', 'worried',
  'hope', 'wish', 'want', 'need',
  'relationship', 'work', 'family', 'friend',
  'struggle', 'challenge', 'success', 'achievement',
  'reflect', 'realize', 'understand', 'learn',
];

export function moderateContent(content: string): ModerationResult {
  const trimmedContent = content.trim();

  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('MODERATING CONTENT:', trimmedContent.substring(0, 100));
  }

  // Check minimum length (avoid spam/test entries)
  if (trimmedContent.length < 10) {
    return {
      isAppropriate: false,
      reason: 'Entry is too short. Please share your thoughts in more detail.',
      category: 'spam',
    };
  }

  // Check for harmful content
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(content)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('BLOCKED by pattern:', pattern);
      }
      return {
        isAppropriate: false,
        reason: 'This content appears to contain harmful or dangerous requests. Lumina Journal is designed for personal reflection and emotional wellbeing only. If you are experiencing thoughts of harming yourself or others, please reach out to a mental health professional or crisis helpline.',
        category: 'harmful',
      };
    }
  }

  // Check for off-topic requests
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(trimmedContent)) {
      return {
        isAppropriate: false,
        reason: 'This appears to be a request for general assistance. Lumina Journal is for personal reflection and emotional processing.',
        category: 'off-topic',
      };
    }
  }

  // Positive signal: Check if content contains journaling indicators
  const lowerContent = content.toLowerCase();
  const hasJournalingKeywords = JOURNALING_KEYWORDS.some(keyword =>
    lowerContent.includes(keyword)
  );

  // If it's reasonably long but has no journaling keywords, it might be off-topic
  if (!hasJournalingKeywords && trimmedContent.length > 30) {
    // Check if it's a question about external facts (not self-reflection)
    if (/^(what|where|when|who|how|why)\s+/i.test(trimmedContent)) {
      return {
        isAppropriate: false,
        reason: 'This looks like a factual question rather than personal reflection. Lumina Journal is for writing about your thoughts, feelings, and experiences.',
        category: 'off-topic',
      };
    }

    const sentences = trimmedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // If it's structured like a command/request (short, imperative)
    if (sentences.length <= 2 && /^(write|create|make|generate|tell|explain|calculate|search|find|show|give|list)/i.test(trimmedContent)) {
      return {
        isAppropriate: false,
        reason: 'This looks like a request rather than a journal entry. Try writing about your thoughts, feelings, or experiences.',
        category: 'off-topic',
      };
    }
  }

  return {
    isAppropriate: true,
  };
}

// Helper to check if content is likely spam/test
export function isLikelySpam(content: string): boolean {
  const trimmed = content.trim();

  // Repeated characters
  if (/(.)\1{10,}/.test(trimmed)) return true;

  // All caps (except very short entries)
  if (trimmed.length > 20 && trimmed === trimmed.toUpperCase()) return true;

  // Common test strings
  const testPatterns = [
    /^(test|testing|asdf|qwer|hello|hi)\s*$/i,
    /^[a-z]\s*$/i,
    /^\d+$/,
  ];

  return testPatterns.some(pattern => pattern.test(trimmed));
}