from sqlalchemy import Column, String, Text, DateTime
import datetime
from src.db.postgres import Base

class Statute(Base):
    __tablename__ = "statutes"

    statute_id = Column(String, primary_key=True, index=True) # e.g. IPC_420
    act_name = Column(String, index=True)                     # e.g. Indian Penal Code
    chapter = Column(String)                                  # e.g. Chapter XVII
    section_number = Column(String, index=True)               # e.g. 420
    section_title = Column(String)                            # e.g. Cheating and dishonestly inducing delivery of property
    text = Column(Text)                                       # The exact legal text
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
