# StudyVault

StudyVault is a study organizer designed to keep learning materials, topic notes, and a personal daily diary in one place. Users can organize study content into categories, subjects, and topics, while the diary provides a space for writing entries and saving highlighted quotes.

The application has a **React frontend** and a **Node.js/Express backend** connected to **MySQL**. At the current stage, category data is connected to the backend from the frontend. Several other screens and interactions are implemented in the frontend but still use React state, so their data is temporary and does not persist after a page reload.

## Features

### Study Vault

- Browse study content using categories, subjects, and topics.
- Create categories, subjects, and topics in the interface.
- Write notes for individual topics.
- Open the file-upload interface for a topic.
- Switch between light and dark themes.

**Data persistence:** Categories are loaded from and saved to the backend. Subjects, topics, and topic notes are currently managed in frontend state and are not persisted after reloading the page. The current upload interface adds a placeholder item locally; it is not yet connected to the backend image-upload API.

### Daily Diary

- Create diary entries with a title and written content.
- Browse entries from the sidebar and select an entry to read.
- Select text from an entry and save it as a highlighted quote.

**Data persistence:** Diary entries and highlighted quotes are currently stored in React state only. The app starts with a sample entry, and changes are lost when the page is reloaded.

## Technology Stack

**Frontend**

- React 19
- Vite
- Axios
- Tailwind CSS 4
- Lucide React

**Backend**

- Node.js
- Express 5
- MySQL (`mysql2`)
- CORS
- dotenv
- Multer

## Project Structure

```text
study-vault/
├── index.js                    # Express server, database connection, API routes, upload setup
├── uploads/                    # Files stored by the backend upload API
├── package.json                # Backend dependencies and scripts
├── .env                        # Local database configuration (create this yourself)
└── study-vault-frontend/
    ├── src/
    │   ├── App.jsx              # Main UI, screens, state, and interactions
    │   ├── main.jsx             # React application entry point
    │   └── index.css            # Tailwind CSS import
    ├── vite.config.js           # Vite, React, and Tailwind configuration
    └── package.json             # Frontend dependencies and scripts
```

## How It Works

When the frontend starts, it requests the category list from `GET /api/categories`. Creating a category sends its name to `POST /api/categories`, and the returned category is added to the interface.

The backend connects to MySQL using the configuration in the root `.env` file. It also exposes the `uploads/` directory through the `/uploads` URL path and provides API routes for categories, subjects, and subject images.

Although the backend includes subject and image routes, the current frontend does not yet use those routes. The subject/topic hierarchy, topic notes, diary entries, and highlighted quotes are currently handled in frontend state.

## Backend API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/categories` | Retrieve categories from MySQL. |
| `POST` | `/api/categories` | Create a category. Expects JSON such as `{ "name": "College" }`. |
| `GET` | `/api/subjects` | Retrieve subjects, ordered by `created_at` descending. |
| `POST` | `/api/subjects` | Create a subject. Expects JSON such as `{ "name": "Mathematics" }`. |
| `POST` | `/api/images` | Upload an image using multipart form data. Expects an `image` file, `subject_id`, and `caption`. |
| `GET` | `/api/images/:subject_id` | Retrieve images associated with a subject. |

The image-upload endpoint stores the uploaded file in `uploads/`, saves its path and caption in MySQL, and returns the stored path. Files in the upload directory are served publicly through `/uploads`.

## Requirements

- Node.js and npm
- A running MySQL server
- A MySQL database with tables matching the queries used in `index.js`

The project currently does not include database schema or migration files. The backend expects:

- A `categories` table.
- A `subjects` table containing a `created_at` column.
- An `images` table containing `subject_id`, `image_path`, and `caption` fields.

Create the database and matching tables before starting the backend. The exact column definitions should match the SQL queries in `index.js`.

## Configuration

Create a `.env` file in the project root, in the same directory as `index.js`:

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=study_vault
PORT=5000
```

Replace the example database values with your local MySQL credentials. `PORT` is optional and defaults to `5000`.

**Keep your real `.env` file and database credentials out of GitHub.** Do not commit passwords, API keys, or other secrets.

## Run Locally

### 1. Start the backend

From the project root (the directory containing `index.js`), install the backend dependencies and start the server:

```bash
npm install
node index.js
```

The backend uses port `5000` by default.

### 2. Start the frontend

Open a second terminal and move into the frontend directory:

```bash
cd study-vault-frontend
npm install
npm run dev
```

Vite will print the local frontend URL in the terminal. It is typically `http://localhost:5173`.

The frontend currently sends API requests directly to `http://localhost:5000`.

## Frontend Scripts

Run these commands from the `study-vault-frontend` directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run the configured lint checks. |

## Current Limitations

- Only categories are currently loaded from and saved to the backend through the frontend.
- Subjects, topics, topic notes, diary entries, and highlighted quotes are stored in frontend state and are lost after a page reload.
- The frontend upload interface does not yet send selected files to `POST /api/images`; it currently creates a local placeholder item.
- The backend image route expects an `image` file field, while the frontend upload interface is not connected to that route.
- The backend currently has no authentication or authorization.
- CORS is enabled for all origins, and uploaded files are publicly accessible through the `/uploads` path.
- The upload route does not currently include file-type or file-size validation.
- Database schema or migration files are not included in the project.

## Future Improvements

- Connect subjects, topics, and notes to MySQL so study data persists across sessions.
- Persist diary entries and highlighted quotes in the database.
- Connect the frontend upload interface to the backend image-upload API.
- Add database schema or migration files and document database initialization.
- Add upload file-type validation and file-size limits.
- Add authentication and authorization if the application is deployed for real users.

---

**StudyVault** — organize your learning, one topic at a time.
