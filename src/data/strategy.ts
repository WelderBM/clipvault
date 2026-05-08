export const FCC_WEIGHTS = {
  portugues: 0.30,
  constitucional: 0.20,
  administrativo: 0.20,
  afo: 0.15,
  legislacao: 0.10,
  historia: 0.03,
  geografia: 0.02,
  ti: 1.00, // Assuming TI is 100% of conhecimentos específicos for now
} as const

export const HOT_TOPICS = [
  "Interpretação de texto (Português)",
  "HAVER/FAZER impessoais sempre singular (Português)",
  "Impeachment — Câmara autoriza, Senado julga (Constitucional)",
  "Anulação x Revogação — Judiciário não revoga (Administrativo)",
  "Estágio probatório = 3 anos LC 053/2001 (Administrativo)",
  "F-E-L-P — estágios da despesa (AFO)",
  "Quórum progressivo ALERR — 1/3 discute, maioria absoluta vota (Legislação)",
  "LGPD — controlador decide, operador executa (TI)",
]
