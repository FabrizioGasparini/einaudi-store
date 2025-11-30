# Einaudi Store

Una piattaforma e-commerce moderna e completa sviluppata per la gestione dello store Einaudi. Il progetto include un catalogo prodotti dinamico, gestione del carrello, autenticazione utenti e una dashboard amministrativa avanzata.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Linguaggio:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Autenticazione:** [NextAuth.js](https://next-auth.js.org/)
- **Icone:** [Lucide React](https://lucide.dev/)

## ✨ Funzionalità Principali

### 🛍️ Storefront (Lato Utente)
- **Catalogo Prodotti:** Visualizzazione a griglia dei prodotti con immagini e prezzi.
- **Dettagli Prodotto:** Pagina di dettaglio con selezione di varianti (taglie) e colori.
- **Carrello:** Gestione completa del carrello (aggiunta, rimozione, modifica quantità).
- **Checkout:** Flusso di ordine semplificato.

### 👨‍💼 Dashboard Amministratore
- **Gestione Inventario:**
  - Aggiunta, modifica ed eliminazione prodotti.
  - Gestione avanzata di varianti e colori per ogni prodotto.
  - Filtri per ricerca rapida (per nome prodotto e stato stock).
- **Gestione Ordini:** Visualizzazione e cambio stato degli ordini.
- **Statistiche:** Panoramica delle vendite e prodotti più popolari.
- **Download:** Area per scaricare report (es. Excel).

## 🛠️ Installazione e Configurazione

### Prerequisiti
- Node.js (v18 o superiore)
- npm o yarn

### 1. Clona il repository
```bash
git clone https://github.com/FabrizioGasparini/einaudi-store.git
cd store-einaudi
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le Variabili d'Ambiente
Crea un file `.env` nella root del progetto e aggiungi le seguenti variabili:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tua-chiave-segreta-super-sicura"

# Google Auth (Opzionale per login Google)
GOOGLE_CLIENT_ID="il-tuo-client-id"
GOOGLE_CLIENT_SECRET="il-tuo-client-secret"
```

### 4. Setup del Database
Inizializza il database SQLite e genera il client Prisma:

```bash
npx prisma generate
npx prisma db push
```

### 5. Avvia il Server di Sviluppo
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel tuo browser.

## 📂 Struttura del Progetto

- `src/app`: Pagine e routing (App Router).
- `src/components`: Componenti React riutilizzabili (UI, Admin, Store).
- `src/lib`: Utility functions e configurazione Prisma.
- `prisma`: Schema del database e migrazioni.
- `public`: Assets statici (immagini, favicon).

## 📝 Licenza

Questo progetto è proprietario e riservato all'uso interno.
