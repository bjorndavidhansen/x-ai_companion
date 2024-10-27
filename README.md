Here’s a well-structured and detailed `README.md` tailored for your **X Activity Companion** project:

---

# **X Activity Companion**  

![Next.js](https://img.shields.io/badge/Next.js-14.2.0-blue?style=flat-square) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.1-green?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=flat-square)  

> **Organize and analyze your X platform activity using AI-powered themes and insights.**  
Stay in control of your online engagement with **smart categorization**, **analytics**, and **privacy-first design**.

---

## **Features**
- **Smart Categorization**: AI-powered theme detection to automatically group your activities (posts, reposts, likes, bookmarks).
- **Insightful Analytics**: Visualize patterns in your engagement with a theme chart and content overview.
- **Privacy First**: Your data is encrypted and never shared without permission.
- **Authentication**: Secure login using **NextAuth** to connect with X and manage your account.

---

## **Table of Contents**
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Available Scripts](#available-scripts)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [License](#license)

---

## **Getting Started**
To get a local copy of the project up and running, follow these steps:

### **Prerequisites**
Ensure you have the following installed:
- **Node.js** (v18+)
- **npm** or **yarn**
- **Git** for version control

### **Environment Variables**
Create a `.env` file at the root of the project and add the following variables:

```bash
# API URLs (Production URLs required for deployment)
NEXT_PUBLIC_API_URL=<your-api-url>
NEXT_PUBLIC_APP_URL=<your-app-url>

# Authentication Secrets
X_CLIENT_ID=<your-client-id>
X_CLIENT_SECRET=<your-client-secret>

# NextAuth secret (required for authentication)
NEXTAUTH_SECRET=<your-secret>
```

---

## **Installation**
Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/bjorndavidhansen/x-ai_companion.git

# Navigate into the project directory
cd x-ai_companion

# Install dependencies
npm install
```

---

## **Running the Project**

### **Development Server**
To start the development server:

```bash
npm run dev
```
This will start the server at `http://localhost:3000`. You can now open this URL in your browser to see the app in action.

### **Production Build**
To build the app for production:

```bash
npm run build
npm start
```
The production build is optimized and ready to be deployed.

---

## **Project Structure**
```
├── app/                    # Next.js pages and layouts
│   ├── dashboard/          # Dashboard page displaying user insights
│   └── page.tsx            # Home page with login CTA
├── components/             # Reusable UI components
│   └── ui/                 # UI components (buttons, cards, modals, etc.)
├── hooks/                  # Custom React hooks for data fetching and state management
├── lib/                    # Helper utilities, authentication, and type guards
├── public/                 # Static assets (e.g., images)
├── styles/                 # Global CSS and Tailwind configuration
└── .env.example            # Sample environment configuration
```

---

## **Available Scripts**
Here are the scripts you can use during development:

| Script             | Description                                |
|--------------------|--------------------------------------------|
| `npm run dev`      | Starts the development server.             |
| `npm run build`    | Builds the app for production.             |
| `npm run start`    | Runs the app in production mode.           |
| `npm run lint`     | Lints the code for errors.                 |
| `npm run lint:fix` | Fixes any linting issues.                  |
| `npm run type-check` | Checks for TypeScript type errors.      |
| `npm run format`   | Formats the code with Prettier.            |

---

## **Technology Stack**
- **Frontend Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth](https://next-auth.js.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **State Management**: React hooks (useState, useEffect)
- **Validation**: Zod for schema validation
- **Type Safety**: TypeScript

---

## **Contributing**
Contributions are welcome! Follow these steps to contribute:

1. Fork the project.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add a cool feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

## **License**
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

## **Acknowledgements**
- **Stock Photos**: [Unsplash](https://unsplash.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)

---

## **Contact**
Created by [Bjorn David Hansen](https://github.com/bjorndavidhansen).  
Feel free to reach out if you have any questions or feedback!

---

This README provides all the necessary information to set up, run, and contribute to the project. It’s structured to make it easy for other developers or users to understand the purpose and usage of the project.
