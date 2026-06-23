"""
Groq AI Service — resume tailoring and qualitative ATS analysis.

Uses the Groq API for fast LLM inference:
- tailor_resume():          Rewrites LaTeX resumes to match job descriptions
- get_qualitative_analysis(): Returns experience alignment, feedback, and
                              suggestions — but NEVER the score itself

The ATS score is calculated deterministically in keyword_extractor.py.
The LLM only provides a quality_score (0–20) and qualitative feedback.
"""
import re
import json
from groq import Groq
from app.config import settings


def get_groq_client() -> Groq:
    """Create and return a Groq API client."""
    return Groq(api_key=settings.groq_api_key)


# ══════════════════════════════════════════════════════════════════════
# RESUME TAILORING (unchanged from original)
# ══════════════════════════════════════════════════════════════════════

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


# ══════════════════════════════════════════════════════════════════════
# QUALITATIVE ATS ANALYSIS (Layer 2 — LLM feedback only, NO score)
# ══════════════════════════════════════════════════════════════════════

ATS_QUALITATIVE_PROMPT = """\
You are a resume analysis assistant. Your job is to provide QUALITATIVE feedback only.

IMPORTANT: You do NOT calculate or return a score. The score is calculated separately \
by a deterministic algorithm. You only provide experience alignment and suggestions.

Given a resume (as plain text) and a job description, analyze the fit and return a JSON object.

## What to evaluate:
1. **quality_score** (integer 0–20): Rate ONLY how well the candidate's actual experience, \
projects, and achievements align with the role's responsibilities. This is NOT about keyword matching \
(that's handled separately). Consider:
   - Does the candidate have relevant project/work experience? (0–8 points)
   - Are their achievements quantified and impactful? (0–6 points)
   - Is the experience level appropriate for the role? (0–6 points)

2. **match_analysis**: 2–3 sentences summarizing the overall fit.

3. **experience_gap**: State the years of experience required by the JD vs what the resume shows. \
If the JD says "3+ years" and the resume shows ~1 year, respond with: \
"JD requires 3 years, resume shows 1 year — 2 years short". \
If there is no gap or the JD doesn't specify years, respond with "none".

4. **domain_mismatch**: true if the resume is in a COMPLETELY unrelated domain \
(e.g., resume is for a chef, JD is for a software engineer). false for any tech-to-tech transition.

5. **missing_keywords**: List of important technical skills/tools from the JD that are \
NOT present in the resume. Focus on hard skills only, not soft skills.

6. **improvement_suggestions**: 3–5 specific, actionable suggestions to improve the resume \
for this specific role.

## Output format:
Return ONLY a valid JSON object. No markdown, no explanation, no code fences.

{
    "quality_score": <integer 0-20>,
    "match_analysis": "<2-3 sentence summary>",
    "experience_gap": "<e.g. 'JD requires 3 years, resume shows 1 year — 2 years short' or 'none'>",
    "domain_mismatch": <true or false>,
    "missing_keywords": ["<keyword1>", "<keyword2>"],
    "improvement_suggestions": ["<suggestion1>", "<suggestion2>"]
}"""


def get_qualitative_analysis(
    resume_plain_text: str,
    job_description: str,
) -> tuple[bool, dict | None, str | None]:
    """
    Get qualitative ATS feedback from the LLM.

    The LLM provides:
    - quality_score (0–20): experience alignment rating
    - match_analysis: summary paragraph
    - experience_gap: years short description
    - domain_mismatch: boolean
    - missing_keywords: list of missing hard skills
    - improvement_suggestions: actionable advice

    The LLM does NOT provide the final ATS score — that's calculated
    deterministically in keyword_extractor.calculate_deterministic_score().

    Args:
        resume_plain_text: Resume converted to plain text (no LaTeX)
        job_description: The job description text

    Returns:
        tuple: (success, analysis_dict, error_message)
    """
    client = get_groq_client()

    user_message = (
        "Analyze this resume against the job description.\n\n"
        "RESUME (plain text):\n"
        f"{resume_plain_text}\n\n"
        "---\n\n"
        "JOB DESCRIPTION:\n"
        f"{job_description}\n\n"
        "---\n\n"
        "Provide qualitative feedback only. Do NOT calculate a final score. "
        "Return the JSON as specified."
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ATS_QUALITATIVE_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.4,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        analysis = json.loads(content)

        # Validate and clamp quality_score to 0–20
        qs = analysis.get("quality_score", 10)
        if not isinstance(qs, int):
            try:
                qs = int(qs)
            except (ValueError, TypeError):
                qs = 10
        analysis["quality_score"] = max(0, min(20, qs))

        # Ensure domain_mismatch is a boolean
        analysis["domain_mismatch"] = bool(analysis.get("domain_mismatch", False))

        # Ensure lists are actually lists
        if not isinstance(analysis.get("missing_keywords"), list):
            analysis["missing_keywords"] = []
        if not isinstance(analysis.get("improvement_suggestions"), list):
            analysis["improvement_suggestions"] = []

        # Ensure experience_gap is a string
        if not isinstance(analysis.get("experience_gap"), str):
            analysis["experience_gap"] = "none"

        return True, analysis, None

    except json.JSONDecodeError as e:
        return False, None, f"Failed to parse AI response as JSON: {str(e)}"
    except Exception as e:
        return False, None, str(e)
