"""
Groq AI Service — resume tailoring using Llama 3.3 70B.

Uses the Groq API for fast LLM inference to analyze job descriptions
and tailor LaTeX resumes to match requirements and keywords.
"""
import re
from groq import Groq
from app.config import settings


def get_groq_client() -> Groq:
    """Create and return a Groq API client."""
    return Groq(api_key=settings.groq_api_key)


SYSTEM_PROMPT = """\
You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

Your task: Given a LaTeX resume and a job description, tailor the resume to better match the job requirements.

## Rules — follow ALL of these strictly:

1. **Output ONLY valid, compilable LaTeX code.** No markdown, no explanations, no code fences, no commentary before or after the LaTeX.
2. **Preserve the exact LaTeX document structure**, packages, formatting commands, and overall layout.
3. **Modify content** (bullet points, skills sections, professional summary, project descriptions) to align with the job description's keywords and requirements.
4. **Use action verbs and quantified achievements** that mirror the job description's language.
5. **Do NOT fabricate experience, skills, or qualifications** the candidate doesn't have. Only reframe, reorganize, and re-emphasize existing content.
6. **Prioritize ATS-friendly keyword matching** — incorporate exact phrases from the job description where they naturally fit.
7. **Keep the resume approximately the same length** as the original.
8. **Reorder sections or bullet points** if a different order better highlights relevant experience for this specific role.

Remember: Your entire response must be ONLY the LaTeX code. Nothing else."""


def tailor_resume(latex_code: str, job_description: str) -> tuple:
    """
    Tailor a LaTeX resume to match a job description using Groq AI.

    Args:
        latex_code: The original LaTeX resume source code
        job_description: The job description text to tailor for

    Returns:
        tuple: (success: bool, tailored_latex: str | None, error: str | None)
    """
    client = get_groq_client()

    user_message = (
        "Here is the original LaTeX resume:\n\n"
        f"{latex_code}\n\n"
        "---\n\n"
        "Here is the job description to tailor for:\n\n"
        f"{job_description}\n\n"
        "---\n\n"
        "Return ONLY the tailored LaTeX code. No explanations, no markdown fences."
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=8192,
        )

        tailored = response.choices[0].message.content
        tailored = strip_code_fences(tailored)

        return True, tailored, None

    except Exception as e:
        return False, None, str(e)


def strip_code_fences(text: str) -> str:
    """Remove markdown code fences if the model added them."""
    pattern = r"^```(?:latex|tex)?\s*\n(.*?)\n```\s*$"
    match = re.match(pattern, text.strip(), re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()
