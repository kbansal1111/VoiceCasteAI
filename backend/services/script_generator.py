import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

STYLE_PROMPTS = {
    "professional": "authoritative, clear, and structured. Use formal language.",
    "conversational": "friendly, engaging, and approachable. Use casual language and rhetorical questions.",
    "energetic": "enthusiastic, dynamic, and punchy. Use short sentences and exclamation where appropriate.",
    "calm": "soothing, measured, and reflective. Use a slow, thoughtful pace.",
}


async def generate(
    blog_text: str,
    style: str = "professional",
    duration_target: int = 5,
    language: str = "en"
) -> str:
    """Convert blog content to a podcast script using Groq."""

    style_desc = STYLE_PROMPTS.get(style, STYLE_PROMPTS["professional"])
    # ~130 words per minute
    target_words = duration_target * 130

    system_prompt = f"""You are an expert podcast scriptwriter. 
Convert the provided blog post into a natural, engaging podcast script.

Style: {style_desc}
Target length: approximately {target_words} words ({duration_target} minutes when spoken aloud).
Language: {language}

Rules:
- Write ONLY the spoken words (no stage directions, no [music], no [pause])
- Start with a compelling hook or intro line
- Break complex ideas into digestible segments
- End with a clear conclusion or call to action
- Write as if speaking directly to one listener
- Do NOT include any headers, bullet points, or markdown formatting
- Output ONLY the script text, nothing else"""

    user_prompt = f"Convert this blog post into a podcast script:\n\n{blog_text[:10000]}"

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=4096,
    )

    return response.choices[0].message.content.strip()
