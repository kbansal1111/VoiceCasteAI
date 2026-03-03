import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SUGGESTED_QUESTIONS = [
    "Can you summarize the main points?",
    "What are the key takeaways?",
    "Explain this concept in simpler terms",
    "What examples were mentioned?",
]


async def chat(
    message: str,
    blog_content: str,
    context_timestamp: float = 0.0,
    history: list = None,
) -> dict:
    """Send a chat message with podcast context and return AI reply + suggestions."""

    system_prompt = f"""You are an intelligent assistant for a podcast about this content:

---
{blog_content[:8000]}
---

The user is currently at timestamp {context_timestamp:.1f} seconds in the podcast.
Answer questions concisely and helpfully based on this content.
Keep responses under 150 words."""

    messages = [{"role": "system", "content": system_prompt}]

    # Add recent history (last 6 messages)
    if history:
        for msg in history[-6:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.7,
        max_tokens=300,
    )

    reply = response.choices[0].message.content.strip()

    # Generate contextual suggestions based on the reply
    suggestions_prompt = f"""Based on this Q&A about a podcast:
Q: {message}
A: {reply}

Generate 2 short follow-up questions (max 10 words each). 
Return as JSON array of strings only. Example: ["Question 1?", "Question 2?"]"""

    try:
        sug_response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": suggestions_prompt}],
            temperature=0.5,
            max_tokens=100,
        )
        import json
        suggestions = json.loads(sug_response.choices[0].message.content.strip())
        if not isinstance(suggestions, list):
            suggestions = SUGGESTED_QUESTIONS[:2]
    except Exception:
        suggestions = SUGGESTED_QUESTIONS[:2]

    return {"reply": reply, "suggestions": suggestions}
