# MindCare AI | Your Personal Wellness Agent

MindCare AI is a state-of-the-art mental wellness platform designed to provide a safe, AI-guided space for emotional support, journaling, and holistic self-care. Built with a focus on privacy and user agency, it leverages advanced AI models to offer personalized insights and supportive companionship.

![MindCare AI Logo](/public/og-image.png)

## Features

### AI-Powered Support
- **AI Wellness Agent**: Real-time conversations with specialized AI personas powered by LangChain
- **Multi-Provider AI**: Support for OpenAI, Anthropic, Groq, Hugging Face, and Google Gemini
- **Personalized Onboarding**: Data-driven flow that adapts the dashboard to your unique needs

### Mental Wellness Tools
- **Journaling**: Secure personal journal entries with AI-powered insights
- **Mood Tracking**: Log daily emotional states with visual analytics
- **Habit & Goal Tracking**: Build resilience through consistent wellness routines
- **Breathing Exercises**: Guided patterns for stress relief and mindfulness
- **Sleep Tracking**: Monitor rest quality with detailed analytics

### Resource Hub
- **Meditation**: Curated guided sessions for focus, relaxation, and sleep
- **Sound Therapy**: Ambient nature sounds for relaxation
- **Physical Exercises**: Guided routines specifically for mental well-being
- **Academic Calendar**: Specialized support for students to manage academic stress

### Professional Support
- **Community**: Share experiences and connect with others on similar journeys
- **Therapists**: Connect with mental health professionals
- **Crisis Support**: Instant access to emergency resources and calming techniques (Rescue mode)

### User Management
- **Role-Based Access**: Dedicated dashboards for Users, Mentors, and Admins
- **Multiple Auth Providers**: Google, GitHub, and email/password authentication
- **Email Verification**: Secure account setup with verification and password reset

### Privacy & Security
- **Hostel Safe Mode**: Visual encryption layer for chat privacy in shared environments
- **Secure Sessions**: Robust authentication via Auth.js (NextAuth v5)
- **Rate Limiting**: Redis-backed protection against abuse
- **Data Encryption**: Secure storage with encrypted sensitive data

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS 4, Framer Motion
- **State Management**: Zustand
- **Database**: MongoDB with Mongoose
- **Authentication**: Auth.js (NextAuth v5)
- **AI & ML**: LangChain, Pinecone, Qdrant (Vector DBs)
- **AI Providers**: OpenAI, Anthropic, Groq, Hugging Face, Google Gemini
- **Caching**: Redis (Upstash), In-memory fallback
- **Analytics**: Recharts for data visualization

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas)
- Redis (optional, for rate limiting)
- API keys for desired AI services

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mindcare-unified
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file:
   ```env
   # Auth
   AUTH_SECRET=your_auth_secret
   AUTH_TRUST_HOST=true

   # Database
   MONGODB_URI=your_mongodb_uri

   # AI Providers
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   GROQ_API_KEY=your_groq_key
   HUGGINGFACE_API_KEY=your_hf_key
   GEMINI_API_KEY=your_gemini_key

   # Vector DB
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX=your_pinecone_index
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_key

   # OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   GITHUB_ID=your_github_id
   GITHUB_SECRET=your_github_secret

   # Redis (optional)
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Authenticated pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── agent-chat/     # AI agent chat
│   │   ├── breathing/      # Breathing exercises
│   │   ├── chat/           # General chat
│   │   ├── community/      # Community posts
│   │   ├── crisis/         # Crisis support
│   │   ├── dashboard/     # Main dashboard
│   │   ├── exercises/      # Physical exercises
│   │   ├── goals/          # Goal tracking
│   │   ├── habits/         # Habit tracking
│   │   ├── insights/       # Analytics & charts
│   │   ├── journal/        # Journaling
│   │   ├── meditation/    # Meditation sessions
│   │   ├── mentor/         # Mentor dashboard
│   │   ├── mood/           # Mood tracking
│   │   ├── rescue/         # Emergency support
│   │   ├── sleep/          # Sleep tracking
│   │   ├── sound-therapy/  # Sound therapy
│   │   └── therapists/     # Therapist directory
│   ├── api/                # API routes
│   └── auth/               # Authentication pages
├── components/             # React components
│   ├── ui/                 # UI primitives
│   ├── dashboard/          # Dashboard widgets
│   └── charts/             # Chart components
├── lib/                    # Utilities & logic
│   ├── auth/               # Auth utilities
│   ├── cache.ts            # Caching logic
│   ├── chat/               # Chat utilities
│   ├── db/                 # Database models
│   └── rateLimit.ts        # Rate limiting
├── store/                  # Zustand stores
└── types/                  # TypeScript definitions
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

Distributed under the MIT License.

---

Built with care for mental well-being.