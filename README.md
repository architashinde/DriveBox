# DriveBox

**A personal file box for documents, images, and media.**
Upload, sort, rename, preview, and share files by email, with passwordless sign-in and a 2 GB space for every account.

🔗 **Live demo:** [drive-box-ten.vercel.app](https://drive-box-ten.vercel.app/)

---

## Features

- **Passwordless auth**: sign up or sign in with your email and a 6-digit one-time code. No passwords to store or forget.
- **Smart drawers**: files are filed automatically by extension into **Documents**, **Images**, **Media** (video and audio), and **Others**.
- **Upload with drag and drop**: multi-file upload, up to **50 MB per file** and **2 GB per account**.
- **In-app preview**: images, PDFs, text/Markdown/CSV/JSON, video, and audio open in a viewer. Office files download to open in their own app.
- **File actions**: rename (extension preserved), view details, download, and delete with a confirmation dialog.
- **Share by email**: give another user access to a file; they see it marked "Shared with you". Only the owner can rename, share, or delete.
- **Search and sort**: debounced name search, plus sorting by newest, oldest, name (A–Z / Z–A), and size.
- **Storage dashboard**: a donut chart and progress bar showing usage by category against the 2 GB quota.
- **Responsive UI**: desktop sidebar, mobile slide-out navigation, loading skeletons, empty states, and error/404 pages.
- **Two backends, one codebase**:
  - **Appwrite mode** for production (Auth, Database, Storage).
  - **Local demo mode** when no Appwrite keys are set: accounts, files, and OTP codes live on your machine, and the code is shown right in the sign-in dialog.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Route Handlers) |
| UI | React 19, TypeScript, [Tailwind CSS v4](https://tailwindcss.com), `tailwindcss-animate` |
| Components | shadcn/ui (new-york style) on Radix UI primitives, `lucide-react` icons |
| Forms and validation | React Hook Form, Zod, `@hookform/resolvers` |
| OTP input | `input-otp` |
| Uploads | `react-dropzone` |
| Backend | [Appwrite](https://appwrite.io) via `node-appwrite` (Email-token auth, Databases, Storage) |
| Fonts | Fraunces (display) and Outfit (body) via `next/font` |
| Deployment | Vercel |

## How It Works

1. **Sign-in**: the server asks Appwrite to email a one-time token (`createEmailToken`). The user enters the 6-digit code, the server exchanges it for a session (`createSession`), and the session secret is stored in an `httpOnly`, `sameSite=strict` cookie (`secure` in production).
2. **Profile**: on first sign-in a user document is created (or linked by email) in the users collection.
3. **Upload**: files are posted to `/api/upload`, validated for size and remaining quota, stored in the bucket, and recorded in the files collection with name, type, extension, size, owner, and shared users.
4. **Access control**: listing, preview, and every mutation re-check the current session on the server. A file is visible to its owner and to emails in its `users` list; only the owner can rename, share, or delete.
5. **Preview/download**: `/api/preview/[id]` (Appwrite) and `/api/blob/[id]` (local mode) stream file bytes with the right `Content-Type`, `Content-Disposition`, and `Cache-Control: private, no-store`.

## Project Structure

```
drivebox/
├── public/                      # Static assets (icon.svg, avatar.svg)
├── src/
│   ├── app/
│   │   ├── (auth)/              # Sign-in and sign-up pages + auth layout
│   │   ├── (root)/              # Authenticated app
│   │   │   ├── page.tsx         # Dashboard: storage chart + recent files
│   │   │   ├── [type]/page.tsx  # Category drawers: documents, images, media, others
│   │   │   ├── layout.tsx       # Sidebar, header, mobile nav, demo banner
│   │   │   ├── loading.tsx      # Skeleton UI
│   │   │   └── error.tsx        # Error boundary
│   │   ├── api/
│   │   │   ├── upload/          # POST multipart upload
│   │   │   ├── verify-otp/      # POST verify code, start session
│   │   │   ├── resend-otp/      # POST send a fresh code
│   │   │   ├── preview/[id]/    # GET file bytes (Appwrite mode)
│   │   │   └── blob/[id]/       # GET file bytes (local demo mode)
│   │   ├── globals.css          # Tailwind v4 theme tokens and utilities
│   │   ├── layout.tsx           # Root layout, fonts, metadata
│   │   └── not-found.tsx
│   ├── components/              # AuthForm, OTPModal, FileUploader, FileCard,
│   │   │                        # FileActions, Search, SortSelect, StorageChart,
│   │   │                        # Sidebar, MobileNavigation, Header, DemoBanner, ...
│   │   └── ui/                  # shadcn/ui primitives (button, input, alert-dialog, sheet, ...)
│   ├── constants/index.ts       # Nav items, sort options, size limits, category metadata
│   ├── lib/
│   │   ├── actions/             # Server Actions (user.actions.ts, file.action.ts)
│   │   ├── appwrite/            # Client factories (session/admin) and config
│   │   ├── data/
│   │   │   ├── drive.ts         # Core data layer: auth, files, sharing, usage
│   │   │   └── local-store.ts   # JSON + blob store for local demo mode
│   │   └── utils.ts             # cn, file-type detection, formatters, helpers
│   └── types/index.ts           # DriveUser, DriveFile, UsageSummary, AuthPayload
├── components.json              # shadcn/ui config
├── next.config.ts               # 50 MB server action limit, Appwrite image hosts
├── tailwind.config.ts
├── postcss.config.mjs
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js **20.9 or newer**
- npm (or pnpm / yarn / bun)
- *(Optional)* an [Appwrite](https://cloud.appwrite.io) project for production mode

### Install and run

```bash
git clone <your-repo-url>
cd drivebox
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With no environment variables set, DriveBox starts in **local demo mode**. Create an account, and the 6-digit code appears in the sign-in dialog instead of being emailed. Data is stored in a git-ignored `.data/` folder.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint with ESLint |

## Connecting Appwrite (production mode)

Copy the example environment file and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint, e.g. `https://cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT` | Project ID |
| `NEXT_PUBLIC_APPWRITE_DATABASE` | Database ID |
| `NEXT_PUBLIC_APPWRITE_USERS` | Users collection ID |
| `NEXT_PUBLIC_APPWRITE_FILES` | Files collection ID |
| `NEXT_PUBLIC_APPWRITE_BUCKET` | Storage bucket ID |
| `NEXT_APPWRITE_KEY` | **Server** API key (never expose publicly) |

Appwrite mode turns on only when **all** variables are present.

### Appwrite setup

1. Create a **project**, a **database**, and a **storage bucket**.
2. Enable **Email OTP / email token** authentication for the project and configure an email provider (SMTP).
3. Create a **users** collection with attributes:
   `fullName` (string), `email` (string), `avatar` (string), `accountId` (string).
4. Create a **files** collection with attributes:
   `name` (string), `url` (string), `type` (string), `extension` (string), `size` (integer), `owner` (string), `accountId` (string), `users` (string array, used for emails shared with), `bucketFileId` (string).
5. Create a **server API key** with scopes for users/sessions, databases, and storage, and put it in `NEXT_APPWRITE_KEY`.

> The data layer inspects the files collection at runtime and only writes attributes that exist. If your collection has no `owner` or `accountId` attribute, uploads return a clear error asking you to add one.

## Deployment

The app is deployed on **Vercel**. To deploy your own:

1. Push the repo to GitHub and import it in Vercel.
2. Add the environment variables above in *Project Settings → Environment Variables*.
3. Deploy.

> Without Appwrite keys, local demo mode writes to the filesystem, which is not persistent on serverless platforms. Use Appwrite for any hosted deployment.

## Limits

- **50 MB** maximum per file
- **2 GB** total storage per account
- Uploads time out after 90 seconds on the client (`maxDuration = 60` on the server route)

## Roadmap Ideas

- Folders and nested organization
- Public share links with expiry
- Trash and restore
- Bulk select, move, and delete
- Resumable and chunked uploads for larger files
- Office document previews

## Acknowledgements

Built with [Next.js](https://nextjs.org), [Appwrite](https://appwrite.io), [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), and [Lucide](https://lucide.dev).
