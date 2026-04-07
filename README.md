# LendLedger 💸

**LendLedger** is a modern, AI-powered full-stack financial ledger application designed to track informal loans, daily transactions, and personal debts. It helps you keep a clear, organized record of "who owes whom" (Hisaab Kitab) with a highly responsive frontend and a robust backend architecture.

Developed by **Rahul Gir** (Senior Software Engineer).

## 🌟 Why Use LendLedger? (Benefits)

- **No More Forgotten Debts:** Keep an accurate track of every penny you give or receive.
- **AI-Powered Insights:** Uses Google Gemini AI to generate polite WhatsApp reminders, monthly financial summaries, and risk assessments for your contacts.
- **Full-Stack Architecture:** Designed with a scalable Java Spring Boot backend and a blazing-fast React frontend.
- **Beautiful & Responsive UI:** Built with a premium glassmorphism design, dark/light mode support, and smooth animations that work perfectly on both mobile and desktop.
- **Exportable Reports:** Instantly generate and download professional PDF statements for any contact.

## 💻 Technologies Used

### Frontend (Client-Side)
- **React 19 & TypeScript:** For building a fast, type-safe, component-based user interface.
- **Vite:** A blazing fast frontend build tool that provides a smooth developer experience.
- **Tailwind CSS v4 & Framer Motion:** For rapid styling, premium glassmorphism design, and fluid animations.
- **Google Gemini API:** Powers the AI Assistant for smart summaries and message generation.
- **jsPDF & Recharts:** For generating downloadable PDF reports and rendering interactive financial charts.

### Backend (Server-Side Architecture)
- **Java 17+:** Core programming language for robust backend logic.
- **Spring Boot 3:** Framework for building scalable, secure RESTful APIs.
- **Spring Data JPA & Hibernate:** For Object-Relational Mapping (ORM) and efficient database interactions.
- **PostgreSQL / MySQL:** Relational database management for secure data persistence.
- **Maven:** For dependency management and project building.

## 🚀 Installation & Local Setup

Follow these steps to run LendLedger on your local machine:

### Prerequisites
- Node.js (v18 or higher)
- Java Development Kit (JDK 17+)
- A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### Frontend Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rahul-AlPHA1/LendLedger.git
   cd LendLedger
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🌐 How to Deploy on Vercel (Frontend)

1. Push your code to a GitHub repository.
2. Go to [Vercel.com](https://vercel.com/) and log in with your GitHub account.
3. Click **Add New...** -> **Project**.
4. Import your `LendLedger` GitHub repository.
5. **Important:** In the "Environment Variables" section before deploying, add:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** `[Paste your Gemini API Key here]`
6. Click **Deploy**. Vercel will build and host your frontend within minutes!

## 👨‍💻 Developer
**Rahul Gir**
- [LinkedIn](https://www.linkedin.com/in/rahool-goswami-4b055a126/)
- [GitHub](https://github.com/Rahul-AlPHA1)
- [Portfolio](https://rahul-alpha1.github.io/RahoolPortfolio.com/)
