# 🚀 ProjectHub

**Personal Project Management Dashboard for Developers & Freelancers**

Aplikasi manajemen project yang membantu developer/freelancer mengelola banyak project sekaligus dengan fitur tracking deadline, pembayaran, domain/hosting, dan income.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.6-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css)

---

## ✨ Features

### 📁 Project Management
- Track multiple projects dengan status (Planning, Active, On Hold, Review, Completed)
- Priority-based sorting dengan deadline tracking
- Client information management
- Tech stack & hosting information
- Repository & live URL links

### 💰 Financial Tracking
- **Payment Types:** Cash, DP, Termin, Cicilan, SaaS, Maintenance
- Invoice generation & tracking
- Income analytics (monthly/yearly)
- Project value vs paid amount
- Pending payment alerts

### 🌐 Digital Assets
- Domain expiry tracking dengan auto-reminder
- Hosting expiry tracking
- Subscription/SaaS revenue tracking
- Renewal reminders (30 days before)

### 📊 Dashboard & Analytics
- Overview semua project
- Income trends & charts
- Deadline calendar
- Smart priority suggestions
- Activity log

### 🔐 Authentication
- Email/Password login
- Google OAuth (ready to configure)
- Secure session management

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Styling | Tailwind CSS |
| UI Components | Custom + Lucide Icons |
| State | Zustand + React Query |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Deployment | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/project-hub.git
cd project-hub

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migration
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/projecthub"
DIRECT_URL="postgresql://user:password@localhost:5432/projecthub"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 📁 Project Structure

```
project-hub/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login, Register pages
│   │   ├── (dashboard)/    # Dashboard, Projects, Tasks, etc.
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── ui/             # Button, Input, Modal, etc.
│   │   ├── layout/         # Navbar, Sidebar
│   │   ├── forms/          # Project, Task, Payment forms
│   │   ├── cards/          # Project, Stats cards
│   │   └── charts/         # Analytics charts
│   ├── lib/
│   │   ├── auth.ts         # NextAuth config
│   │   ├── prisma.ts       # Prisma client
│   │   └── validations/    # Zod schemas
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   └── types/              # TypeScript types
├── docs/
│   ├── BACKEND_REQUIREMENTS.md
│   ├── FRONTEND_REQUIREMENTS.md
│   └── DEVELOPMENT_FLOW.md
└── public/
```

---

## 📊 Database Schema

```
User ──────< Project ──────< Task
                │──────< Payment ──────< Income
                │──────< Invoice
                │──────< Domain
                │──────< Hosting
                └──────< Subscription
```

**12 Tables:** User, Account, Session, Project, Task, Payment, Invoice, Income, Domain, Hosting, Subscription, Reminder

---

## 🎨 UI Features

- **Dark Theme** - Easy on the eyes
- **Responsive** - Works on desktop, tablet, mobile
- **Animations** - Smooth transitions with Framer Motion
- **Drag & Drop** - Reorder projects and tasks
- **Right Panel** - CRUD forms slide in from right
- **Toast Notifications** - Action feedback

---

## 📝 Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Database
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev    # Run migrations
npx prisma db seed    # Seed database
npx prisma generate   # Generate Prisma client
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
vercel
```

### Database Options

| Provider | Free Tier | Recommended For |
|----------|-----------|-----------------|
| Vercel Postgres | 256MB | Production |
| Neon | 512MB | Development |
| Supabase | 500MB | Full BaaS |
| Railway | $5/month credit | Simple setup |

---

## 📖 Documentation

- [Backend Requirements](./docs/BACKEND_REQUIREMENTS.md) - ERD, API, Database Schema
- [Frontend Requirements](./docs/FRONTEND_REQUIREMENTS.md) - UI/UX, Components, Animations
- [Development Flow](./docs/DEVELOPMENT_FLOW.md) - Step-by-step guide

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 👨‍💻 Author

Built with ❤️ for managing multiple projects without losing sanity.

---

**⭐ Star this repo if you find it useful!**
