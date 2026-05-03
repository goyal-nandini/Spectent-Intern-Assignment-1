# Feedback Form System
### SPECTENT SERVICES PRIVATE LIMITED — Intern Assignment: Build, Break & Explain

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [How to Run Locally](#how-to-run-locally)
5. [Task 1 — Break Your Own System](#task-1--break-your-own-system)
6. [Task 2 — Top 3 Fixes](#task-2--top-3-fixes)
7. [Task 3 — Explain Your Approach](#task-3--explain-your-approach)
8. [Task 4 — Scale Thinking](#task-4--scale-thinking)

---

## Project Overview

A simple Feedback Form system with a frontend and backend.  
Users can submit their Name, Email, and Feedback through a form.  
The backend validates the input, stores it in-memory, and returns a success or error response.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js + Express |
| Storage | In-memory array |
| Extras | express-rate-limit, cors |

---

## Folder Structure

```
feedback-system/
│
├── backend/
│   ├── server.js
│   └── package.json
│
└── frontend/
    └── index.html
```

---

## How to Run Locally

**Step 1 — Clone the repository**
```bash
git clone <your-repo-link>
cd feedback-system
```

**Step 2 — Start the backend**
```bash
cd backend
npm install
node server.js
```
Server runs at: `http://localhost:3000`

**Step 3 — Open the frontend**

Open `frontend/index.html` directly in your browser. No extra setup needed.

**Step 4 — Test it**

Fill in the form and hit Submit. You should see a success message.  
To test the API directly:
```bash
curl -X POST http://localhost:3000/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"Nandini","email":"nandini@example.com","feedback":"Great product!"}'
```

---

## Task 1 — Break Your Own System

> Listed below are 10 real ways this system can fail — covering invalid inputs, edge cases, and real-world scenarios.

| # | Failure Scenario | What Happens |
|---|---|---|
| 1 | All fields left empty and form submitted | Without backend check, null values get stored |
| 2 | Email entered as `abc@` or `user@domain` (no TLD) | Basic regex passes it as valid — bad data stored |
| 3 | Whitespace-only input (`"   "`) in any field | `"   "` is not empty — passes required field check silently |
| 4 | Submit button clicked multiple times rapidly | Same feedback stored 4–5 times as duplicate entries |
| 5 | Extremely long input (50,000 characters in feedback) | No length limit — server memory bloat, UI overflow |
| 6 | `<script>alert("xss")</script>` entered as name | Stored as-is — if rendered without sanitization, executes in browser |
| 7 | Server crashes or is offline when user submits | Frontend shows a blank page or hangs with no error message |
| 8 | Someone bypasses the frontend and spams the API directly with a script | Thousands of entries flood the in-memory array — server crashes |
| 9 | Server restarts (crash, redeploy) | All stored feedback is permanently lost — in-memory has no persistence |
| 10 | User on slow mobile network — request times out | No timeout handler on frontend — button stays frozen, user has no idea what happened |

---

## Task 2 — Top 3 Fixes

### Fix 1 — Whitespace Trimming (Backend)

**Problem:** A user typing `"   "` (only spaces) in any field would pass the required field check because `"   "` is technically not empty.

**Fix applied in `server.js`:**
```javascript
name     = typeof name     === "string" ? name.trim()     : "";
email    = typeof email    === "string" ? email.trim()    : "";
feedback = typeof feedback === "string" ? feedback.trim() : "";
```

**Why I chose this:**  
This is a silent data quality bug. The system appears to work but stores garbage. It's the kind of issue that goes unnoticed until you review stored data and find hundreds of whitespace-only entries. Fixing it at the backend ensures it's caught regardless of what the frontend does.

---

### Fix 2 — Disable Submit Button After Click (Frontend)

**Problem:** Clicking Submit multiple times before the server responds sends duplicate requests — resulting in multiple identical entries stored.

**Fix applied in `index.html`:**
```javascript
submitBtn.disabled = true;
submitBtn.textContent = "Submitting...";

// In finally block — always runs after success or error
submitBtn.disabled = false;
submitBtn.textContent = "Submit Feedback";
```

**Why I chose this:**  
Double-submission is an extremely common real-world bug, especially on slow connections where users click again thinking nothing happened. This fix also improves UX — the button text changing to "Submitting..." tells the user their action was registered.

---

### Fix 3 — Rate Limiting (Backend)

**Problem:** The POST `/feedback` endpoint is completely open. Anyone with Postman or a simple script can flood it with thousands of requests per second, crashing the server.

**Fix applied in `server.js`:**
```javascript
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute window
  max: 5,                 // max 5 submissions per IP per minute
  message: {
    success: false,
    error: "Too many submissions. Please wait a minute."
  }
});

app.post("/feedback", feedbackLimiter, (req, res) => { ... });
```

**Why I chose this:**  
Fix 2 only protects honest users. Fix 3 protects against intentional abuse. An unprotected API is a real security and stability risk. Even at a small scale, a single bad actor can take the server down. Rate limiting is low-effort, high-impact protection.

---

## Task 3 — Explain Your Approach

### Why I designed it this way

I kept the stack as simple as possible — Express for the backend, plain HTML/CSS/JS for the frontend with no frameworks. The assignment scope is a single form with one API endpoint. Bringing in React or a database would be over-engineering for what's needed here. Simple stack means easier to read, easier to debug, and faster to build.

I chose in-memory storage (a JavaScript array) because the assignment explicitly allows it, and it lets me focus on demonstrating good API design and validation logic rather than database setup.

---

### Trade-offs I made

| Decision | Trade-off |
|---|---|
| In-memory storage | Fast to set up, but data is lost on every server restart |
| No authentication | API is open — anyone can submit, no way to identify users |
| Single HTML file for frontend | Simple and portable, but doesn't scale if the UI grows |
| No logging | Easier to read code, but hard to debug issues in production |

---

### What I would improve with more time

- **Persistent storage** — Replace the in-memory array with SQLite or PostgreSQL so data survives server restarts
- **Input sanitization** — Sanitize name and feedback fields to prevent XSS before storing or rendering
- **Proper error logging** — Add Morgan or Winston for request and error logs
- **Unit tests** — Write tests for the validation logic covering all edge cases
- **Email confirmation** — Send an automated email to the user confirming their feedback was received
- **Frontend timeout handling** — Add a `fetch` timeout so if the server doesn't respond in 10 seconds, the user gets a clear message

---

## Task 4 — Scale Thinking

> If 10,000 users use this system simultaneously, here's what breaks:

**1. Memory crash**  
Every submission is stored in a JavaScript array in RAM. At 10,000 entries with large feedback texts, the process runs out of memory and crashes. Fix: use a real database (PostgreSQL, MongoDB).

**2. Single server bottleneck**  
One Node.js process handles all requests. Under heavy concurrent load, requests queue up and response times spike. Fix: run multiple instances behind a load balancer (e.g. Nginx + PM2 cluster mode).

**3. Rate limiter becomes insufficient**  
Per-IP rate limiting works fine at small scale but at 10,000 users it needs to be backed by Redis (shared state across multiple server instances) instead of in-memory — otherwise each server instance has its own counter and the limit is ineffective.

**4. No queue for submissions**  
If 500 people hit Submit at the exact same second, the server tries to process all 500 simultaneously. Fix: use a message queue (Bull + Redis) to process submissions sequentially without dropping requests.

**5. No monitoring**  
At scale, you need to know when the server is slow or down before users complain. Fix: add uptime monitoring (e.g. UptimeRobot) and application performance monitoring.

---

*Submitted by: Nandini | SPECTENT SERVICES PRIVATE LIMITED | Internship Assignment | 03.05.2026*

