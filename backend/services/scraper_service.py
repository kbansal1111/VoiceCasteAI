import requests
from bs4 import BeautifulSoup
import re


async def scrape(url: str) -> str:
    """Scrape blog content from a URL, returning clean text."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove junk elements more aggressively
    for tag in soup(["script", "style", "nav", "header", "footer",
                     "aside", "iframe", "noscript", "form",
                     "button", "advertisement", "ads", "social", "share"]):
        tag.decompose()

    # Try to find main article content with better heuristics
    # Priority: article > main > .post-content > .article-body > body
    article = (
        soup.find("article") or
        soup.find("main") or
        soup.find("div", class_=re.compile(r"(post-content|article-body|entry-content|blog-post)", re.I)) or
        soup.find("div", id=re.compile(r"(post-content|article-body|entry-content|blog-post)", re.I)) or
        soup.find("div", class_=re.compile(r"(content|post|article|entry|blog)", re.I)) or
        soup.find("body")
    )

    if article:
        # Get text but try to keep some structure
        text = article.get_text(separator="\n", strip=True)
    else:
        text = soup.get_text(separator="\n", strip=True)

    # Clean up: remove excessive newlines and repetitive whitespace
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Final cleanup of lines
    lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 20]
    text = "\n".join(lines)

    if len(text) < 150:
        # Fallback to a simpler extraction if too short
        text = soup.get_text(separator=" ", strip=True)
        text = re.sub(r'\s+', ' ', text)

    if len(text) < 100:
        raise ValueError("Could not extract meaningful content from URL. Site might be protected or content-empty.")

    return text[:15000]  # Reasonable limit for LLM context
