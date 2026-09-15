import asyncio
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from qdrant_client.models import PointStruct
from src.db.qdrant_client import get_qdrant_client, init_qdrant_collection
from src.services.embedder import EmbedderService

COLLECTION_NAME = "legal_templates"
VECTOR_SIZE = 384

TEMPLATES = [
    {
        "title": "Legal Notice for Breach of Contract",
        "description": "A standard legal notice format sent by an aggrieved party to a defaulting party demanding cure of a breach of contract under Indian Law.",
        "content": """
[YOUR NAME/LAW FIRM HEADER]
[ADDRESS]

Ref. No. ___________                               Date: [INSERT DATE]

REGISTERED A.D. / SPEED POST

To,
[INSERT DEFENDANT NAME]
[INSERT DEFENDANT ADDRESS]

SUBJECT: LEGAL NOTICE FOR BREACH OF CONTRACT DATED [INSERT CONTRACT DATE]

Under instructions from and on behalf of my client [INSERT CLIENT NAME], resident of [INSERT CLIENT ADDRESS] (hereinafter referred to as "My Client"), I hereby serve upon you the following Legal Notice:

1. That My Client and you entered into an agreement titled [INSERT CONTRACT NAME] on [INSERT CONTRACT DATE].
2. That as per Clause [INSERT CLAUSE NUMBER] of the said Agreement, you were obligated to [INSERT OBLIGATION].
3. That you have failed to perform the aforementioned obligation, which constitutes a material breach of the Agreement.
4. [INSERT ADDITIONAL FACTUAL DETAILS HERE].

I, therefore, call upon you through this Legal Notice to [INSERT DEMAND, e.g., pay the sum of Rs. XXXX / rectify the breach] within [INSERT NOTICE PERIOD] days from the receipt of this notice, failing which My Client shall be constrained to initiate appropriate civil and/or criminal proceedings against you in the competent courts of [INSERT JURISDICTION, e.g., High Court of Judicature at Bombay], holding you liable for all costs and consequences thereof.

Yours sincerely,

[SIGNATURE]
Advocate for [INSERT CLIENT NAME]
"""
    },
    {
        "title": "Non-Disclosure Agreement (NDA)",
        "description": "A standard unilateral or bilateral Non-Disclosure Agreement under Indian Contract Act.",
        "content": """
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (this "Agreement") is entered into as of [INSERT DATE] by and between:
1. [INSERT PARTY A NAME], having its principal place of business at [INSERT PARTY A ADDRESS] ("Disclosing Party"), and
2. [INSERT PARTY B NAME], having its principal place of business at [INSERT PARTY B ADDRESS] ("Receiving Party").

1. Confidential Information: "Confidential Information" shall mean any and all technical and non-technical information provided by the Disclosing Party to the Receiving Party, including but not limited to trade secrets, proprietary information, financial data, and business plans.
2. Non-Disclosure Obligations: The Receiving Party agrees to hold all Confidential Information in strict confidence and not to disclose such Confidential Information to any third parties without the prior written consent of the Disclosing Party.
3. Exclusions: Confidential Information shall not include information that is currently in the public domain or independently developed by the Receiving Party.
4. Term: The obligations of this Agreement shall survive for a period of [INSERT NUMBER] years from the date of disclosure.
5. Governing Law and Jurisdiction: This Agreement shall be governed by the laws of India. Any dispute arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts at [INSERT JURISDICTION].

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.

Disclosing Party: ___________________
Receiving Party: ___________________
"""
    }
]

def ingest_templates():
    qdrant = get_qdrant_client()
    init_qdrant_collection(qdrant, COLLECTION_NAME, VECTOR_SIZE)
    embedder = EmbedderService("all-MiniLM-L6-v2")

    print(f"Ingesting {len(TEMPLATES)} templates...")
    points = []
    
    for i, temp in enumerate(TEMPLATES):
        text_to_embed = f"{temp['title']} - {temp['description']}"
        vector = embedder.embed_text(text_to_embed)
        
        payload = {
            "title": temp["title"],
            "description": temp["description"],
            "content": temp["content"]
        }
        
        point_id = str(uuid.uuid4())
        points.append(PointStruct(id=point_id, vector=vector, payload=payload))

    if points:
        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print("Successfully ingested templates to Qdrant!")

if __name__ == "__main__":
    ingest_templates()
