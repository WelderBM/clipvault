# ClipVault

> Salva rápido. Usa no momento certo. Nunca perde.

PWA mobile-first para salvar e gerenciar textos com lifecycle (ativo → usado → arquivado).

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (mobile first)
- Firebase (Auth Google + Firestore)
- vite-plugin-pwa

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

Crie um arquivo `.env` na raiz com base no `.env.example`:

```bash
cp .env.example .env
```

Preencha com os valores do seu Firebase Console (Project Settings → Web app).

### 3. Configurar Firestore Security Rules

No Firebase Console → Firestore → Rules, cole o conteúdo de `firestore.rules`.

### 4. Criar índices Firestore

No Firebase Console → Firestore → Indexes, crie os índices compostos:

| Collection | Fields | Order |
|---|---|---|
| `users/{uid}/cards` | `status` ASC, `createdAt` DESC | - |

Ou deixe o Firestore criar automaticamente ao rodar o app pela primeira vez (ele vai mostrar um link no console do navegador).

### 5. Rodar localmente

```bash
npm run dev
```

### 6. Build para produção

```bash
npm run build
```

## Deploy sugerido: Vercel ou Firebase Hosting

```bash
# Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Estrutura Firestore

```
users/
  {userId}/
    cards/
      {cardId}/
        title: string | null
        text: string
        color: string
        emoji: string
        category: string
        status: 'active' | 'used' | 'archived'
        createdAt: Timestamp
        usedAt: Timestamp | null
```
