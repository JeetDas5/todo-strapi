# TaskFlow: Full-Stack Todo Application

TaskFlow is a full-stack, secure task management application built using a Next.js frontend and a Strapi v5 backend. It features robust user authentication, server-side route guarding, visual password visibility toggles, responsive task lists, and custom database access-control rules.

*   **Live Demo:** [https://todo-strapi.vercel.app/](https://todo-strapi.vercel.app/)

---

## Repository Structure

The project is split into two directories:
*   `backend/`: Headless CMS and API database services powered by Strapi v5.
*   `frontend/`: Client application built with Next.js and Tailwind CSS.

---

## Tech Stack

### Frontend
*   **Core:** Next.js 16.2 (React 19)
*   **Styling:** Tailwind CSS v4, Lucide React (Icons)
*   **HTTP Client:** Axios (featuring response interceptors for global Strapi error parsing)
*   **State Management & Utilities:** React Hooks, `clsx`, `tailwind-merge`
*   **Notifications:** Sonner

### Backend
*   **CMS Framework:** Strapi v5 (Headless Node.js CMS)
*   **Development Database:** SQLite
*   **Production Database:** PostgreSQL (compatible with Render databases)
*   **Language:** TypeScript

---

## Features

*   **Secure Route Guarding:** Server-side route proxying redirects unauthenticated users away from the dashboard and prevents logged-in users from accessing the login or register pages.
*   **Ownership Constraints:** Overridden collection controllers ensure users can only retrieve, create, update, or delete tasks associated with their own accounts.
*   **Tactile Form Inputs:** Interactive form controls featuring password toggling and user-friendly server error parsing.

---

## API Documentation

All request URLs below assume the backend server is running locally on `http://localhost:1337/api`.

### Authentication

#### Register User
*   **Endpoint:** `POST /auth/local/register`
*   **Description:** Creates a new user account.
*   **Request Body:**
    ```json
    {
      "username": "johndoe",
      "email": "johndoe@example.com",
      "password": "Password123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "jwt": "eyJhbGciOi...",
      "user": {
        "id": 1,
        "documentId": "abc123xyz",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "provider": "local",
        "confirmed": true,
        "blocked": false,
        "createdAt": "2026-06-12T18:07:21.000Z",
        "updatedAt": "2026-06-12T18:07:21.000Z"
      }
    }
    ```

#### Login User
*   **Endpoint:** `POST /auth/`
*   **Description:** Authenticates an existing user and returns a JSON Web Token.
*   **Request Body:**
    ```json
    {
      "identifier": "johndoe@example.com",
      "password": "Password123"
    }
    ```
*   **Response (200 OK):** Same structure as the registration response.

#### Get Current User Context
*   **Endpoint:** `GET /users/me`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Retrieves profile information for the authenticated user.

---

### Todos Management

All requests in this section require the `Authorization: Bearer <JWT_TOKEN>` header.

#### Fetch Todos
*   **Endpoint:** `GET /todos`
*   **Description:** Returns only the todos owned by the authenticated user.
*   **Response (200 OK):**
    ```json
    {
      "data": [
        {
          "id": 5,
          "documentId": "hocuvnbpdbibj5su2r4qvae2",
          "title": "Complete Next.js Integration",
          "completed": false,
          "createdAt": "2026-06-12T18:07:21.353Z",
          "updatedAt": "2026-06-12T18:07:21.353Z"
        }
      ],
      "meta": {}
    }
    ```

#### Create Todo
*   **Endpoint:** `POST /todos`
*   **Description:** Creates a new todo item. Ownership is automatically assigned to the authenticated user on the backend.
*   **Request Body:**
    ```json
    {
      "data": {
        "title": "Complete Next.js Integration"
      }
    }
    ```

#### Update Todo
*   **Endpoint:** `PUT /todos/:documentId`
*   **Description:** Updates the fields of a specific todo. Write-actions are restricted to the owner.
*   **Request Body:**
    ```json
    {
      "data": {
        "completed": true
      }
    }
    ```

#### Delete Todo
*   **Endpoint:** `DELETE /todos/:documentId`
*   **Description:** Deletes a specific todo. Destructive actions are restricted to the owner.
*   **Response (204 No Content):** Successful deletion.

---

## Installation & Setup

### Prerequisites
*   Node.js 18.x or 20.x
*   npm or yarn

### Setup Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template and configure it:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server in development mode:
   ```bash
   npm run develop
   ```

### Setup Frontend
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

Built with ❤️ by [Jeet Das](https://github.com/JeetDas5)