import OpenAI from 'openai'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

const MODEL = 'meta-llama/llama-3.2-3b-instruct'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
    })
  }
  return client
}

export function isConfigured(): boolean {
  return OPENROUTER_API_KEY.length > 0
}

export async function generateMatchExplanation(
  customerProfile: string,
  matchProfile: string,
): Promise<string> {
  if (!isConfigured()) {
    return 'AI explanation unavailable — OpenRouter API key not configured.'
  }

  const prompt = `You are a precise matchmaker assistant. Given two real profiles below, explain in exactly 2-3 sentences why they are compatible.

RULES:
- Reference SPECIFIC details from the profiles (age, city, religion, profession, hobbies, values, preferences).
- Do NOT make generic statements like "they seem like a good match" or "based on their profiles".
- Mention concrete shared traits or complementary differences.
- Keep it to 2-3 sentences, no more.

CUSTOMER PROFILE:
${customerProfile}

POTENTIAL MATCH PROFILE:
${matchProfile}

Write the compatibility explanation:`

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.4,
  })

  return response.choices[0]?.message?.content?.trim() || 'Compatibility explanation could not be generated.'
}

export async function generateIntroEmail(
  customerProfile: string,
  matchProfile: string,
  matchmakerName: string,
): Promise<string> {
  if (!isConfigured()) {
    return 'AI intro unavailable — OpenRouter API key not configured.'
  }

  const prompt = `You are a matchmaker writing a short, warm intro email. The matchmaker (${matchmakerName}) is introducing one person to another profile.

RULES:
- 2-3 short paragraphs max.
- Reference REAL details from the profiles (shared city, profession, education, hobbies, values).
- Name the person being introduced and their specific attributes.
- Do NOT use filler phrases like "I think you'll like them" — state facts.
- End with: Warmly, ${matchmakerName} - The Date Crew

PROFILE A (the person receiving this intro):
${customerProfile}

PROFILE B (the person being introduced):
${matchProfile}

Write the email:`

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 250,
    temperature: 0.5,
  })

  return response.choices[0]?.message?.content?.trim() || 'Introduction email could not be generated.'
}

export async function summarizeNotes(rawNotes: string): Promise<string> {
  if (!isConfigured()) {
    return 'Note summary unavailable — OpenRouter API key not configured.'
  }

  const prompt = `Summarize these matchmaker notes into a tight structured format. Be specific — reference actual details mentioned.

Format:
OBSERVATIONS: (2-3 specific points)
COMPATIBILITY SIGNALS: (1-2 concrete signals)
CONCERNS: (1-2 specific concerns)
NEXT STEPS: (1-2 actionable steps)

Raw notes:
${rawNotes}

Summary:`

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content?.trim() || 'Summary could not be generated.'
}
