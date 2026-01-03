# Live Cursor Tracker

A real-time web application where multiple users can see each other’s cursor movements live on a shared screen.  
The project focuses on **real-time communication, performance optimization, and clean system design** using lightweight web technologies.

---

## 📌 Overview

Live Cursor Tracker allows users to join a shared dashboard after explicit consent and broadcast their cursor movements to other connected users in real time.  
Each user can choose a username and cursor color, selectively view other users’ cursors, pause sharing, exit and rejoin sessions, and switch between light and dark themes.

The project is designed to handle multiple concurrent users efficiently while maintaining smooth visual feedback.

---

## 🚀 Features

- Real-time cursor sharing across multiple users
- User consent modal before starting tracking
- Custom username and cursor color selection
- Throttled cursor updates to reduce network load
- Smooth cursor movement using linear interpolation
- Users list with live status (active / paused)
- Toggle visibility of individual users’ cursors
- Pause / resume cursor sharing
- Exit and rejoin session cleanly
- Light mode / dark mode toggle with persistence
- Automatic cleanup on user disconnect

---

## 🧠 Core Engineering Challenges & Solutions

### 1. High-Frequency Mouse Events

**Problem:**  
Mouse movement can generate hundreds of events per second. Sending every event over the network would quickly overload the server and degrade performance.

**Solution – Throttling:**  
Cursor position updates are emitted only once every **50 milliseconds**, limiting the number of network messages to approximately 20 updates per second per user.

This significantly reduces bandwidth usage while maintaining responsiveness.

---

### 2. Jerky Cursor Movement Due to Throttling

**Problem:**  
Throttling cursor updates can cause visible jumps in cursor position on the receiving side.

**Solution – Linear Interpolation:**  
Instead of instantly snapping the cursor to its latest received position, the client smoothly animates the cursor using linear interpolation (`lerp`) combined with `requestAnimationFrame`.

This results in fluid, natural-looking cursor movement despite reduced update frequency.

---

### 3. User Privacy & Consent

**Problem:**  
Cursor movement data is sensitive and should not be shared without user approval.

**Solution:**  
A consent modal is displayed on initial load. Cursor tracking and broadcasting begin only after the user explicitly agrees, provides a username, and selects a cursor color.  
Users can exit at any time, which resets their session and removes them from the shared view.

---

## 🏗️ Project Structure

live-cursor-tracker/ \n
│\n
├── client/\n
│ ├── index.html # UI, consent modal, controls\n
│ ├── style.css # Styling, layout, dark mode\n
│ └── script.js # Client-side logic\n
│\n
├── server/\n
│ ├── index.js # Express + Socket.IO server\n
│ └── package.json\n
│\n
├── .gitignore\n
└── README.md\n


---

## ⚙️ Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express
- **Real-Time Communication:** Socket.IO
- **Version Control:** Git & GitHub

---

## ▶️ How to Run Locally

1. Clone the repo from GitHub
2. cd server
3. npm install
4. node index.js
5. Open client/index.html in browser


## Design Decisions

- No authentication or database
- Vanilla JS for simplicity
- Focus on performance and correctness
Optional Enhancements
- Draggable shared objects
- User labels
- Room-based tracking

## License
Educational and demonstration purposes only.
