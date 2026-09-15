from sqlalchemy import Column, Integer, String, Text, Date, JSON
from src.db.postgres import Base

class Judgment(Base):
    __tablename__ = "judgments"

    id = Column(Integer, primary_key=True, index=True)
    case_name = Column(String, index=True, nullable=False)
    court = Column(String, index=True)
    judgment_date = Column(Date)
    text = Column(Text, nullable=False)
    citations_graph = Column(JSON, nullable=True)
