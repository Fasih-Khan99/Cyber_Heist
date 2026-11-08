# Cyber Heist — Next.js, Tailwind CSS and Firebase

## Project structure

```text
cyber-heist-nextjs/
├── app/ (Next.js App Router pages and global styles)
├── components/ (interactive game UI)
├── lib/ (Firebase connection and question-group retrieval)
├── scripts/ (one-time Firestore seed script)
├── types/ (TypeScript data models)
├── .env.example
├── firestore.rules
├── package.json
└── README.md
```

## Setup

1. Install Node.js LTS. Run `npm install` in this folder.
2. Create a Firebase project at https://console.firebase.google.com/. Add a Web App and create a Cloud Firestore database.
3. Copy `.env.example` to `.env.local` and populate the `NEXT_PUBLIC_FIREBASE_*` values from Firebase project settings.
4. In Firebase Console → Project settings → Service accounts, generate a private key. Save it as `serviceAccountKey.json` in this project root. Never commit or share this file. It is ignored by git.
5. Run `npm run seed:questions` to upload the three question sets.
6. Publish the rules in `firestore.rules` in Firestore → Rules.
7. Run `npm run dev` and open http://localhost:3000.

## Question bank and random assignment

Firestore collection: `questionGroups`. Documents: `groupA`, `groupB`, `groupC`. Each document contains 8 questions: 2 password security, 2 phishing detection, 2 network defence and 2 digital forensics. On each new game, the client randomly selects one group. Different devices make independent selections, so they may receive different sets or the same set by chance. The chosen set remains fixed during that game. This is random selection, not guaranteed balanced assignment.

## Gameplay

Five-minute timer, three lives, eight questions, +100 points per correct answer (maximum 800), four section clues and final vault code `4729`. Each section has two questions.

## Security limitation

This is a classroom prototype. The browser reads the answer keys from Firestore and validates the vault code client-side. Do not use this architecture for secure exams or production authentication. For a real assessment, keep answer keys and scoring validation on a trusted server or Cloud Function, and consider Firebase Authentication and App Check.
