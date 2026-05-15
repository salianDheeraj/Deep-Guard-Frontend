# Deep Guard Frontend

Deep Guard Frontend is a modern, responsive web application for Deepfake Detection, built with [Next.js 15](https://nextjs.org/) and [React 18](https://react.dev/). It features a sleek UI with dark/light mode support, complex data visualization for analysis results, and a robust authentication system.

> **For a detailed technical overview, please refer to the [System Architecture](ARCHITECTURE.md).**

## 🚀 Tech Stack

-   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Animations:** [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
-   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Themes:** [next-themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode)

## ✨ Key Features

### 1. Analysis Dashboard
-   **Video Analysis:** Upload videos to see frame-by-frame deepfake confidence scores.
-   **Image Analysis:** Supports single and batch image uploads.
-   **Interactive Charts:** "Confidence Over Time" charts to pinpoint fake segments in videos.
-   **Detailed Reports:** View annotated frames and download analysis reports.
-   **Deepfake Alerts:** Immediate visual feedback with confidence scores (Real vs Fake).

### 2. Authentication & User Management
-   **Secure Auth:** JWT-based authentication with auto-refresh mechanism (every 14 mins).
-   **Login/Signup:** Animated login pages with form validation.
-   **Guest Mode:** "Try without an account" feature for quick, stateless trials.
-   **Account Settings:** Update profile information and change passwords.
-   **Session Handling:** Automatic session expiry handling and secure logout.

### 3. Modern UI/UX
-   **Responsive Design:** Fully optimized for mobile, tablet, and desktop.
-   **Dark Mode:** Seamless switching between light and dark themes.
-   **Interactive Elements:** Smooth transitions and micro-interactions powered by Framer Motion.

## 🛠️ Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (Latest LTS)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   Running [Deep-Guard-Backend](../Deep-Guard-Backend)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd Deep-Guard-Frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    NEXT_PUBLIC_ENABLE_SERVER_LOGOUT=true
    ```

### Running the App

-   **Development:** `npm run dev`
    Open [http://localhost:3000](http://localhost:3000) with your browser.

-   **Production Build:**
    ```bash
    npm run build
    npm start
    ```

-   **Linting:** `npm run lint`

### Docker

To run the frontend in Docker, add a standard multi-stage Next.js Dockerfile at the project root, then use these commands.

1.  Build the image:
    ```bash
    docker build -t deep-guard-frontend .
    ```

2.  Run the container:
    ```bash
    docker run --rm -p 3000:3000 --env-file .env.local deep-guard-frontend
    ```

3.  Confirm `NEXT_PUBLIC_API_URL` points to the backend service reachable from the container.

## 📂 Project Structure

```
Deep-Guard-Frontend/
├── public/             # Static assets (images, icons)
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── dashboard/  # Dashboard, Analysis, History, Account
│   │   ├── login/      # Login page
│   │   ├── signup/     # Signup page
│   │   └── ...
│   ├── components/     # Reusable UI components
│   │   ├── AnalysisPage.tsx       # Core analysis logic
│   │   ├── DashboardStatCard.tsx  # Overview stats
│   │   ├── Login.tsx              # Auth forms
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities (API, store, auth)
│   │   ├── store/      # Zustand stores (analysisStore.ts)
│   │   ├── api.ts      # API fetch wrapper
│   │   └── auth.ts     # Auth helpers
│   ├── styles/         # CSS modules and globals
│   └── types/          # TypeScript interfaces
├── next.config.ts      # Next.js configuration
├── tailwind.config.ts  # Tailwind configuration
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please ensure you lint your code (`npm run lint`) before submitting a pull request.

## 📄 License

[ISC License](LICENSE)
