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


ATS_SYSTEM_PROMPT = """\
You are a strict ATS (Applicant Tracking System) scoring engine.
Your task: Analyze a LaTeX resume against a job description and return a PRECISE score.

## STRICT SCORING RULES — YOU MUST FOLLOW THESE EXACTLY:

Step 1 — Extract required skills from the job description.
Step 2 — Check each required skill against the resume. Mark each as PRESENT or MISSING.
Step 3 — Extract required years of experience from the JD. Compare with resume.
Step 4 — Calculate score using this exact formula:
    - Start at 100
    - Each MISSING core/required skill: subtract 8 points
    - Each MISSING preferred/bonus skill: subtract 3 points
    - Each year of experience short of requirement: subtract 5 points
    - Resume has completely unrelated domain: subtract 20 points
    - Final score cannot go below 0

The score MUST reflect the actual deductions you calculated. 
A resume missing 5 required skills CANNOT score above 60.
A resume matching all skills CANNOT score below 80.
NEVER output 85, 90, 92 as a default — calculate it strictly.

## Output Format:
Return ONLY a valid JSON object. No markdown, no explanation, nothing else.

{
    "evaluation_steps": {
        "required_skills_found": ["<skill1>", "<skill2>"],
        "required_skills_missing": ["<skill1>", "<skill2>"],
        "preferred_skills_missing": ["<skill1>"],
        "experience_gap": "<e.g. JD requires 3 years, resume shows 1 year — deduct 10 points>",
        "deduction_breakdown": "<e.g. 3 missing required skills (-24) + 2 missing preferred (-6) = -30 total>"
    },
    "score": <integer strictly calculated from deductions above>,
    "match_analysis": "<2-3 sentences on how well the candidate fits>",
    "missing_keywords": ["<keyword1>", "<keyword2>"],
    "improvement_suggestions": ["<specific action 1>", "<specific action 2>"]
}
"""

import json

def analyze_resume_ats(latex_code: str, job_description: str) -> tuple:
    client = get_groq_client()

    user_message = (
        "Analyze this resume against the job description.\n\n"
        "RESUME (LaTeX):\n"
        f"{latex_code}\n\n"
        "---\n\n"
        "JOB DESCRIPTION:\n"
        f"{job_description}\n\n"
        "---\n\n"
        "Follow the scoring rules strictly. "
        "Extract every required skill from the JD, check each one in the resume, "
        "calculate deductions mathematically, then return the JSON."
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ATS_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,       # higher = less repetitive
            max_tokens=2048,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        analysis = json.loads(content)

        # Validate the score is actually an integer in range
        score = analysis.get("score")
        if not isinstance(score, int) or not (0 <= score <= 100):
            analysis["score"] = max(0, min(100, int(score)))

        return True, analysis, None

    except json.JSONDecodeError as e:
        return False, None, f"Failed to parse AI response as JSON: {str(e)}"
    except Exception as e:
        return False, None, str(e)
