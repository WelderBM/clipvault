import PyPDF2
import json
import re

with open('rr_const.pdf', 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'

# Find articles using regex
article_pattern = re.compile(r'(Art\.\s*\d+.*?)(?=(Art\.\s*\d+)|$)', re.DOTALL)
articles = article_pattern.findall(text)

parsed_articles = []
for article_match in articles:
    article_text = article_match[0]
    
    # Extract number
    num_match = re.search(r'Art\.\s*(\d+)', article_text)
    if not num_match:
        continue
    
    num = int(num_match.group(1))
    
    # Filter the ranges: 30-67, 111-116
    if (30 <= num <= 67) or (111 <= num <= 116):
        # We need to clean the text from newlines inside paragraphs
        clean_text = re.sub(r'\n', ' ', article_text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Determine number string
        numero = f"Art. {num}" + ("º" if num <= 9 else "")
        
        # Get caput
        # Caput usually ends before §, I., etc.
        caput_match = re.search(r'Art\.\s*\d+[^A-Za-z]*(.*?)(?=(§|\sI\s|- I\s|– I\s|I -|I –|$))', clean_text)
        caput = caput_match.group(1).strip() if caput_match else clean_text
        
        # Paragrafos
        paragrafos = []
        p_matches = re.findall(r'(§\s*\d+º?.*?|Parágrafo único.*?)(?=(§\s*\d+º?|Parágrafo único|$))', clean_text)
        for p in p_matches:
             p_clean = p[0].strip()
             if p_clean and p_clean not in paragrafos:
                 paragrafos.append(p_clean)
                 
        # Incisos
        incisos = []
        i_matches = re.findall(r'(?:\s|^)(X{0,3}(?:IX|IV|V?I{0,3}))\s*[-–]\s*(.*?)(?=(?:\s|^)X{0,3}(?:IX|IV|V?I{0,3})\s*[-–]|§|Parágrafo único|$)', clean_text)
        for i in i_matches:
             i_clean = f"{i[0]} - {i[1].strip()}"
             incisos.append(i_clean)
        
        art_obj = {
            "numero": numero,
            "caput": caput,
            "hotFCC": False,
            "tags": ["Constituição Estadual"]
        }
        if paragrafos:
            art_obj["paragrafos"] = paragrafos
        if incisos:
            art_obj["incisos"] = incisos
            
        parsed_articles.append(art_obj)

print(f"Found {len(parsed_articles)} articles")

with open('parsed_const.json', 'w', encoding='utf-8') as out:
    json.dump(parsed_articles, out, ensure_ascii=False, indent=2)

