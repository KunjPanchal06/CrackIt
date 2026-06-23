from pydantic import BaseModel
from typing import List

class AtsAnalyzeRequest(BaseModel):
    resume_id: str
    job_description: str

class AtsAnalyzeResponse(BaseModel):
    score: int
    match_analysis: str
    missing_keywords: List[str]
    improvement_suggestions: List[str]
