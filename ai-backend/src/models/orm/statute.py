from sqlalchemy import Column, Integer, String, Text, Date
from src.db.postgres import Base

class Statute(Base):
    __tablename__ = "statutes"

    id = Column(Integer, primary_key=True, index=True)
    act_name = Column(String, index=True, nullable=False)
    chapter_number = Column(String, index=True)
    chapter_title = Column(String)
    section_number = Column(String, index=True, nullable=False)
    section_title = Column(String)
    text = Column(Text, nullable=False)
    enactment_date = Column(Date, nullable=True)
