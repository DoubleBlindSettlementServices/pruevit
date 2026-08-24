# Pruevit.com — Case Value Insight Platform

Secure, professional web application for insurance companies and plaintiff/defense attorneys to upload case documents and receive **non-legal** AI-generated case value range estimates powered by **Grok**.

> **This is not a law firm and does not provide legal advice.**

## Features

- **Authentication & roles**: Admin, Insurance, Attorney, Claimant (NextAuth + credentials)
- **Secure file upload**: PDF, images, Word — categorized (medical records, police reports, photos, demand letters, economic loss, expert reports)
- **AES-256-GCM encryption at rest** + TLS in transit
- **Grok AI analysis engine** via xAI API (structured value ranges + factors + limitations)
- **Mandatory disclaimers** on every relevant page
- **1-year automatic data retention** + user-initiated soft delete
- **Case management list** + case detail view
- **Admin panel** with platform stats
- Clean professional UI (blue / gray Tailwind design)
- Production-oriented structure (Prisma, Zod validation, role checks, middleware)

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- NextAuth.js
- Prisma (SQLite for local; swap to PostgreSQL for production)
- xAI Grok API (OpenAI-compatible client)
- Node crypto for encryption

## Quick start

```bash
cd pruevit
cp .env.example .env
# Edit .env: set NEXTAUTH_SECRET, ENCRYPTION_KEY, XAI_API_KEY

npm install
npx prisma db push
npm run db:seed

npm run dev
```

Open http://localhost:3000

**Default seed accounts**

| Email | Password | Role |
|-------|----------|------|
| admin@pruevit.com | ChangeMeAdmin!23 | ADMIN |
| attorney@example.com | AttorneyDemo!23 | ATTORNEY |

## Security notes (production)

1. Use PostgreSQL + strong connection string; enable connection pooling.
2. Generate strong `NEXTAUTH_SECRET` and `ENCRYPTION_KEY`.
3. Serve only over HTTPS. Set secure cookies.
4. Place `uploads/` outside the web root and restrict OS permissions.
5. Add rate limiting, virus scanning (ClamAV), and audit logging.
6. Implement a scheduled job to hard-delete expired / soft-deleted files after retention window.
7. Consider client-side encryption for true end-to-end if regulatory requirements demand it.
8. Do not index the site; keep `robots: noindex`.
9. Review and harden Content-Security-Policy headers.
10. Never log PHI or full document contents.

## Environment variables

See `.env.example`.

## License

Proprietary — for authorized use only.
