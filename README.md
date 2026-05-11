# 🌿 MindCare AI | Your Personal Wellness Agent

MindCare AI is a state-of-the-art mental wellness platform designed to provide a safe, AI-guided space for emotional support, journaling, and holistic self-care. Built with a focus on privacy and user agency, it leverages advanced AI models to offer personalized insights and supportive companionship.

![MindCare AI Logo](/public/og-image.png)

## ✨ Core Features

### 🤖 AI-Guided Emotional Support

- **Wellness Support Agent**: Real-time conversations with specialized AI personas (powered by LangChain, OpenAI, Groq, and Anthropic).
- **Personalized Onboarding**: A data-driven flow that adapts the dashboard to your unique needs.
- **Crisis Support (Rescue)**: Instant access to emergency resources and calming techniques.

### 📊 Holistic Health Tracking

- **Mood Tracking & Journaling**: Log your daily emotional state and reflect through secure journal entries.
- **Habit & Goal Monitoring**: Build resilience by tracking consistent wellness routines.
- **Sleep & Breathing Analytics**: Monitor your rest and practice guided breathing exercises for stress relief.
- **Wellness Insights**: Data-driven visualizations of your progress using Recharts.

### 🧘 Resource Hub

- **Meditation & Sound Therapy**: Curated audio and sessions for focus, relaxation, and sleep.
- **Physical Exercises**: Guided routines specifically for mental well-being.
- **Academic Calendar Integration**: Specialized support for students to manage academic stress.

### 🛡️ Privacy & Security

- **Hostel Safe Mode**: A unique visual encryption layer for chat privacy in shared environments.
- **Secure Authentication**: Robust session management via Auth.js (NextAuth) and MongoDB.
- **Role-Based Access**: Dedicated dashboards for **Users**, **Mentors**, and **Admins**.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/)
- **Backend & Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **AI Orchestration**: [LangChain](https://js.langchain.com/), [Pinecone](https://www.pinecone.io/) (Vector DB)
- **AI Providers**: OpenAI, Anthropic, Groq, Hugging Face, Google Gemini
- **Authentication**: [Auth.js](https://authjs.dev/) (NextAuth.js v5)
- **Visualization**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (Local or Atlas)
- API Keys for AI services (OpenAI, Groq, etc.)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/MindCare.git
   cd MindCare
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:

   ```env
   # Auth configuration
   AUTH_SECRET=your_auth_secret

   # Database
   MONGODB_URI=your_mongodb_uri

   # AI Service Providers
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   GROQ_API_KEY=your_groq_key
   HUGGINGFACE_API_KEY=your_hf_key
   GEMINI_API_KEY=your_gemini_key

   # Vector DB
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX=your_pinecone_index
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```bash
src/
├── app/             # Next.js App Router (Pages, Layouts, API routes)
├── components/      # Reusable UI components & Layout wrappers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions, DB connection, AI logic
├── models/          # Mongoose schemas for MongoDB
├── store/           # Zustand state management
└── types/           # TypeScript definitions
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ for mental well-being.
