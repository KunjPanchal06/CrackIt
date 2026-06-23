from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.models.ats import AtsAnalyzeRequest, AtsAnalyzeResponse
from app.services import resume_service
from app.services.groq_service import analyze_resume_ats

router = APIRouter()

@router.post("/analyze", response_model=AtsAnalyzeResponse)
async def analyze_resume(
    body: AtsAnalyzeRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Analyze a resume against a job description using Groq AI.
    Returns ATS score, missing keywords, and improvement suggestions.
    """
    user_id = current_user.get("sub")
    
    # Fetch the resume
    resume = resume_service.get_resume(body.resume_id, user_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )
        
    latex_code = resume["latex_code"]
    
    # Perform ATS Analysis
    success, analysis, error = analyze_resume_ats(latex_code, body.job_description)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ATS Analysis failed: {error}",
        )
        
    return AtsAnalyzeResponse(
        score=analysis.get("score", 0),
        match_analysis=analysis.get("match_analysis", "No analysis provided."),
        missing_keywords=analysis.get("missing_keywords", []),
        improvement_suggestions=analysis.get("improvement_suggestions", [])
    )
