import json

with open("parsed_const.json", "r", encoding="utf-8") as f:
    artigos = json.load(f)

# Wrap it in DocumentOficial
document = {
    "id": "constituicao-estadual-rr-completa",
    "titulo": "Constituição do Estado de Roraima (Arts. 30–67 e 111–116)",
    "fonte": "PDF Oficial - al.rr.leg.br",
    "atualizadoEm": "2023-12-31",
    "observacao": "Arts. 30–67 (Poder Legislativo) e 111–116 (Servidores Públicos e Finanças)",
    "artigos": artigos
}

with open("src/data/constituicao_estadual_rr.json", "w", encoding="utf-8") as f:
    json.dump(document, f, ensure_ascii=False, indent=2)

print("Created src/data/constituicao_estadual_rr.json")
