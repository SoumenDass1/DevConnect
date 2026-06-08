# DevConnect

DevConnect is a modern, full-stack web application designed for developers to create stunning portfolios, manage projects, and connect with other professionals in the industry.

## Features

- **User Authentication**: Secure JWT-based login and registration.
- **Dynamic Portfolios**: Public profile pages with dynamic Dark/Light themes.
- **Project Management**: Add, edit, and manage your development projects with live links and repo links.
- **Developer Search**: Find other developers based on their name, title, or skills.
- **Modern UI**: Clean, SaaS-style interface built entirely with Plain CSS (Flexbox/Grid, zero CSS frameworks).

## Technology Stack

### Frontend
- **React (Vite)**
- **React Router** for navigation
- **Axios** for API requests
- **Plain CSS (CSS3)** with modern animations

### Backend
- **Node.js & Express.js**
- **MongoDB** with Mongoose
- **JWT** (JSON Web Tokens) for authentication
- **Bcrypt.js** for password hashing

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory.

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/devconnect
   JWT_SECRET=supersecretjwtkey_for_devconnect_app
   NODE_ENV=development
   ```
   Run the backend server:
   ```bash
   node server.js
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Run the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:5173`.

## Architecture Highlights
- Uses a Context API (`AuthContext`, `ThemeContext`) for state management.
- All styles are component-scoped via separate `.css` files without using utility classes like Tailwind.
- Fully responsive mobile-first design.

## Author
Built by Soumen Dass.
