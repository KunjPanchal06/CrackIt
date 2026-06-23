"""
ATS Analysis — Pydantic request/response models.

The response now includes a full score breakdown showing how the
deterministic score was calculated (keyword, preferred, quality components).
"""
from pydantic import BaseModel
from typing import List, Optional


class AtsAnalyzeRequest(BaseModel):
    resume_id: str
    job_description: str


class ScoreBreakdown(BaseModel):
    """Detailed breakdown of how the ATS score was calculated."""
    keyword_score: int          # Points from required keyword matches (max 60)
    keyword_max: int            # Always 60
    preferred_score: int        # Points from preferred keyword matches (max 20)
    preferred_max: int          # Always 20
    quality_score: int          # LLM experience alignment rating (max 20)
    quality_max: int            # Always 20
    raw_score: int              # Sum before penalties
    domain_penalty: int         # -20 if domain mismatch, else 0
    experience_penalty: int     # -10 per year short
    total_penalty: int          # Sum of penalties
    final_score: int            # Final clamped score


class AtsAnalyzeResponse(BaseModel):
    """Complete ATS analysis result combining deterministic + LLM layers."""
    score: int
    score_breakdown: ScoreBreakdown

    # Keyword match details
    required_keywords_matched: List[str]
    required_keywords_missing: List[str]
    preferred_keywords_matched: List[str]
    preferred_keywords_missing: List[str]

    # LLM qualitative feedback
    match_analysis: str
    experience_gap: str
    domain_mismatch: bool
    missing_keywords: List[str]              # From LLM (may overlap with above)
    improvement_suggestions: List[str]
