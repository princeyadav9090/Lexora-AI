from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import sys

def create_constitution_pdf(filename="Constitution_of_India.pdf"):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    text_content = [
        "THE CONSTITUTION OF INDIA",
        "",
        "PREAMBLE",
        "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a",
        "SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens:",
        "JUSTICE, social, economic and political;",
        "LIBERTY of thought, expression, belief, faith and worship;",
        "EQUALITY of status and of opportunity; and to promote among them all",
        "FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation;",
        "IN OUR CONSTITUENT ASSEMBLY this twenty-sixth day of November, 1949, do HEREBY",
        "ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION.",
        "",
        "PART III: FUNDAMENTAL RIGHTS",
        "Right to Equality",
        "Article 14. Equality before law: The State shall not deny to any person equality before the law",
        "or the equal protection of the laws within the territory of India.",
        "",
        "Article 15. Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth:",
        "(1) The State shall not discriminate against any citizen on grounds only of religion, race,",
        "caste, sex, place of birth or any of them.",
        "",
        "Right to Freedom",
        "Article 19. Protection of certain rights regarding freedom of speech, etc.:",
        "(1) All citizens shall have the right—",
        "(a) to freedom of speech and expression;",
        "(b) to assemble peaceably and without arms;",
        "(c) to form associations or unions;",
        "(d) to move freely throughout the territory of India;",
        "(e) to reside and settle in any part of the territory of India; and",
        "(g) to practise any profession, or to carry on any occupation, trade or business.",
        "",
        "Article 21. Protection of life and personal liberty:",
        "No person shall be deprived of his life or personal liberty except according to",
        "procedure established by law.",
    ]
    
    y = height - 50
    for line in text_content:
        c.drawString(50, y, line)
        y -= 20
        if y < 50:
            c.showPage()
            y = height - 50
            
    c.save()
    print(f"Created {filename}")

if __name__ == "__main__":
    create_constitution_pdf()
