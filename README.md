# 🎓 Aivalytics Skill Builder - Placement Portal



A comprehensive, state-of-the-art career readiness and placement preparation platform. This system is designed to simulate real-world recruitment processes for top companies like **TCS** and **Wipro**, providing students with a realistic testing environment and AI-driven feedback.

---

## 🌟 Key Features

### 🚀 Dynamic Placement Flows
Specialized recruitment tracks tailored to specific companies:
- **TCS Track**: Includes Foundation (Numerical, Verbal, Reasoning), Advanced (Quantitative & Logical), and Coding assessments. Automated pathing to **Ninja** or **Digital** roles based on performance.
- **Wipro Track**: Includes Aptitude (Quant, Logical, Verbal), Essay Writing with AI evaluation, and Coding assessments. Automated pathing to **Elite** or **Turbo** tracks.

### 🤖 AI-Powered Intelligence
- **Personalized Feedback**: Integrated with **Google Gemini AI** to provide detailed analysis of test performance.
- **Automated Essay Evaluation**: Real-time scoring and feedback for essay writing tasks.
- **Voice Assessment**: AI-driven communication scoring (Fluency, Pronunciation, Pace, Clarity).

### 🛡️ Smart Proctoring & Monitoring
- **Event Tracking**: Detects tab switching, window blurring, and other suspicious activities during tests.
- **Integrity Reports**: Detailed monitoring logs generated for every assessment.

### 📊 Advanced Analytics
- **User Dashboard**: Visual progress tracking using **Recharts**.
- **Admin Panel**: Comprehensive oversight of users, tests, and platform performance.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | **Next.js 16** (App Router), **React 19**, **TypeScript** |
| **Styling** | **Tailwind CSS**, **Framer Motion**, **Radix UI** |
| **Backend** | **Next.js API Routes**, **Prisma ORM** |
| **Database** | **PostgreSQL** (via Prisma) |
| **Auth** | **NextAuth.js** (Credentials & Role-based access) |
| **AI** | **Google Generative AI (Gemini 1.5/2.0)** |

---

## 🏗️ Technical Architecture

### Data Model Overview
- **User**: Handles authentication and stores academic profiles.
- **Test & Question**: Structured repository for assessment content with support for MCQ, Coding, and Essay types.
- **PlacementApplication**: Tracks the student's journey through a company-specific recruitment flow.
- **AssessmentStage**: Records detailed performance data for each step (Foundation, Coding, etc.).
- **MonitoringEvent**: Captures proctoring data for integrity checks.

### Role-Based Access Control (RBAC)
- **User Role**: Access to practice tests, placement applications, and performance dashboards.
- **Admin Role**: Full control over content management, user administration, and platform configuration.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- PostgreSQL instance

### Quick Start
1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file from the example provided:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/aivalytics"
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   GEMINI_API_KEY="your-gemini-key"
   ```

3. **Database Migration & Seeding**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run setup  # Runs the custom setup script
   ```

4. **Run Application**:
   ```bash
   npm run dev
   ```

---

## 📝 Admin Management (CSV Upload)

Admins can upload questions in bulk using CSV files. The system supports maintaining the **exact upload sequence** of questions.

### CSV Template Structure
- **TCS Foundation**: Numerical, Verbal, Reasoning categories.
- **Wipro Aptitude**: Quantitative, Logical, Verbal categories.
- **Coding/Essay**: Specific templates for prompt-based questions.

*Templates can be found in the `docs/csv-templates/` directory.*

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages & APIs)
│   ├── admin/            # Admin dashboard routes
│   ├── api/              # Backend API endpoints
│   ├── dashboard/        # User dashboard
│   └── placements/       # Placement flow pages
├── components/           # Reusable UI components
│   ├── ui/               # Radix-based base components
│   ├── placement/        # Placement-specific components
│   └── proctoring/       # Monitoring components
├── lib/                  # Shared utilities and API clients
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
└── prisma/               # Database schema and migrations
```

---

## 📈 Future Roadmap
- [ ] Integration with more companies (Infosys, HCL, etc.)
- [ ] Real-time coding compiler with test case validation
- [ ] Mock Interview simulations using Voice AI
- [ ] Placement notification system (Email/SMS)

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Project Owner**: Aivalytics Team
