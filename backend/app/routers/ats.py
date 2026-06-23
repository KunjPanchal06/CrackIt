"""
ATS Analysis Router — hybrid scoring endpoint.

The /analyze endpoint performs two-layer ATS scoring:

Layer 1 (Deterministic):
    - Extracts keywords from the JD
    - Converts LaTeX resume to plain text
    - Matches keywords with synonym normalization
    - Calculates keyword_score (0–60) + preferred_score (0–20)

Layer 2 (LLM Qualitative):
    - Gets experience alignment quality_score (0–20)
    - Gets match analysis, experience gap, domain mismatch flags
    - Gets improvement suggestions

Final score = Layer 1 + Layer 2 quality_score - penalties
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.models.ats import AtsAnalyzeRequest, AtsAnalyzeResponse, ScoreBreakdown
from app.services import resume_service
from app.services.groq_service import get_qualitative_analysis
from app.services.keyword_extractor import (
    latex_to_plain_text,
    extract_keywords_from_jd,
    match_keywords_against_resume,
    calculate_deterministic_score,
    parse_experience_gap,
)

router = APIRouter()


@router.post("/analyze", response_model=AtsAnalyzeResponse)
async def analyze_resume(
    body: AtsAnalyzeRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Analyze a resume against a job description using hybrid ATS scoring.

    Step 1: Fetch resume from database
    Step 2: Convert LaTeX → plain text
    Step 3: Extract & classify JD keywords (required vs preferred)
    Step 4: Match keywords against resume text
    Step 5: Get LLM qualitative analysis (quality_score, suggestions)
    Step 6: Calculate final score deterministically in Python
    Step 7: Return score + breakdown + feedback
    """
    user_id = current_user.get("sub")

    # ── Step 1: Fetch the resume ──
    resume = resume_service.get_resume(body.resume_id, user_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    latex_code = resume["latex_code"]

    # ── Step 2: Convert LaTeX to searchable plain text ──
    resume_text = latex_to_plain_text(latex_code)

    # ── Step 3: Extract keywords from the job description ──
    required_keywords, preferred_keywords = extract_keywords_from_jd(
        body.job_description
    )

    # ── Step 4: Match keywords against resume ──
    req_matched, req_missing = match_keywords_against_resume(
        required_keywords, resume_text
    )
    pref_matched, pref_missing = match_keywords_against_resume(
        preferred_keywords, resume_text
    )

    # ── Step 5: Get LLM qualitative analysis ──
    success, ai_analysis, error = get_qualitative_analysis(
        resume_text, body.job_description
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS Analysis failed: {error}",
        )

    # ── Step 6: Calculate deterministic score ──
    experience_gap_years = parse_experience_gap(
        ai_analysis.get("experience_gap", "none")
    )

    final_score, breakdown = calculate_deterministic_score(
        matched_required=len(req_matched),
        total_required=len(required_keywords),
        matched_preferred=len(pref_matched),
        total_preferred=len(preferred_keywords),
        ai_quality_score=ai_analysis.get("quality_score", 10),
        domain_mismatch=ai_analysis.get("domain_mismatch", False),
        experience_gap_years=experience_gap_years,
    )

    # ── Step 7: Assemble response ──
    return AtsAnalyzeResponse(
        score=final_score,
        score_breakdown=ScoreBreakdown(**breakdown),

        # Keyword match details
        required_keywords_matched=req_matched,
        required_keywords_missing=req_missing,
        preferred_keywords_matched=pref_matched,
        preferred_keywords_missing=pref_missing,

        # LLM qualitative feedback
        match_analysis=ai_analysis.get("match_analysis", "No analysis provided."),
        experience_gap=ai_analysis.get("experience_gap", "none"),
        domain_mismatch=ai_analysis.get("domain_mismatch", False),
        missing_keywords=ai_analysis.get("missing_keywords", []),
        improvement_suggestions=ai_analysis.get("improvement_suggestions", []),
    )
