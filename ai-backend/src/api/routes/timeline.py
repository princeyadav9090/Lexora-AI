from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
from src.models.llm.factory import get_llm
from dateutil import parser as date_parser

router = APIRouter()

class TimelineEvent(BaseModel):
    date: str = Field(description="The extracted date of the event (YYYY-MM-DD if exact, or descriptive if ambiguous)")
    description: str = Field(description="A concise description of the event")
    parties: List[str] = Field(description="The people or entities involved in this event")
    is_ambiguous: bool = Field(description="True if the exact date is unclear (e.g., 'Spring 2022', 'two weeks later')")

class TimelineExtraction(BaseModel):
    events: List[TimelineEvent]

class TimelineRequest(BaseModel):
    text: str

class ProcessedTimelineEvent(BaseModel):
    date: str
    description: str
    parties: List[str]
    is_ambiguous: bool
    limitation_warning: bool

class TimelineResponse(BaseModel):
    timeline: List[ProcessedTimelineEvent]

def check_limitation(date_str: str, is_ambiguous: bool) -> bool:
    """
    Checks if the date is older than 3 years (standard Limitation Act, 1963 for civil suits).
    Returns True if time-barred, False otherwise.
    """
    if is_ambiguous:
        return False
    
    try:
        # Attempt to parse
        dt = date_parser.parse(date_str, fuzzy=True)
        three_years_ago = datetime.now() - timedelta(days=3*365)
        return dt < three_years_ago
    except Exception:
        return False

@router.post("/extract", response_model=TimelineResponse)
async def extract_timeline(request: TimelineRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    llm = get_llm()
    structured_llm = llm.with_structured_output(TimelineExtraction)
    
    prompt = f"""You are Lexora AI, an expert litigation support tool.
Your task is to extract a chronological timeline of events from the provided legal text.
Infer relative dates if possible (e.g., if contract signed Jan 1, 2020, and breached two weeks later, the breach is Jan 15, 2020).
If a date is too vague to pin down to a specific day/month, set is_ambiguous to true.

Text:
{request.text}

Return the chronological sequence of events.
"""
    
    try:
        result = structured_llm.invoke(prompt)
        
        processed_events = []
        for event in result.events:
            is_barred = check_limitation(event.date, event.is_ambiguous)
            
            processed_events.append(ProcessedTimelineEvent(
                date=event.date,
                description=event.description,
                parties=event.parties,
                is_ambiguous=event.is_ambiguous,
                limitation_warning=is_barred
            ))
            
        return TimelineResponse(timeline=processed_events)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
