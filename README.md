# Website Prompt Improver

Transform rough website ideas into structured, actionable prompts ready for website builders.

## Overview

This full-stack application takes a user's rough website idea and converts it into a comprehensive, structured prompt with sections for goal, target audience, brand vibe, key pages, features, content inputs, SEO keywords, and suggested tech stack.

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Vite
- **No database required** - pure logic-based processing

## Project Structure

```
.
├── server/          # Express backend
│   ├── src/
│   │   ├── index.js      # Express server setup
│   │   └── improver.js   # Deterministic prompt improvement logic
│   └── package.json
├── client/          # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── main.jsx      # React entry point
│   │   ├── api.js        # API client functions
│   │   └── styles.css    # Application styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

   The server will run on **http://localhost:4000**

   For production:
   ```bash
   npm start
   ```

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The client will run on **http://localhost:5173**

### Changing API Base URL

If your backend runs on a different URL or port, you can configure it in the client:

1. Create a `.env` file in the `client/` directory:
   ```
   VITE_API_BASE_URL=http://localhost:4000
   ```

2. Or modify `client/src/api.js` and update the `API_BASE_URL` constant.

## Usage

1. Open http://localhost:5173 in your browser
2. Enter your website idea in the textarea (minimum 10 characters)
3. Click "Improve Prompt" or try one of the example prompts
4. View the improved, structured prompt
5. Click "Copy" to copy the prompt to your clipboard

## API Endpoints

### POST /api/improve

Improves a website idea into a structured prompt.

**Request Body:**
```json
{
  "idea": "a website for a mobile car wash in Cairo"
}
```

**Response:**
```json
{
  "improvedPrompt": "# Website Build Prompt\n\n## Goal\n...",
  "meta": {
    "detectedIndustry": "Automotive",
    "detectedAudience": "Consumers",
    "tone": "Professional"
  }
}
```

**Validation:**
- `idea` is required and must be a string
- Minimum length: 10 characters
- Maximum length: 1000 characters

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## How It Works

The improvement logic uses deterministic heuristics (no external AI APIs):

1. **Industry Detection**: Analyzes keywords to detect the industry (E-commerce, SaaS, Restaurant, Fitness, etc.)
2. **Audience Detection**: Identifies target audience based on keyword patterns
3. **Tone Detection**: Determines the brand tone (Professional, Friendly, Modern, etc.)
4. **Prompt Building**: Constructs a structured markdown prompt with:
   - Goal (extracted from the idea)
   - Target audience
   - Brand vibe / visual style
   - Key pages with descriptions
   - Core homepage sections
   - Key features / functionality
   - Content inputs needed
   - SEO keywords suggestions
   - Suggested tech stack

## Development Notes

- The server uses ES modules (`"type": "module"` in package.json)
- CORS is enabled for the React dev server (localhost:5173)
- Error handling includes proper HTTP status codes and error messages
- The frontend includes loading states, error messages, and copy-to-clipboard functionality

## Building for Production

### Backend

The server can be run directly with Node.js in production using `npm start`.

### Frontend

Build the React app for production:

```bash
cd client
npm run build
```

The built files will be in `client/dist/`. You can preview the production build with:

```bash
npm run preview
```

