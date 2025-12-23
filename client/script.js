/* ===== Socket Setup ===== */
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
});

/* ===== State ===== */
const cursors = {};
const targetPositions = {};
const visibleUsers = new Set();

let hasJoined = false;
let myUsername = "";
let myColor = "#ff0000";
let isPaused = false;

/* ===== Theme ===== */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

/* ===== DOM Elements ===== */
const modal = document.getElementById("consentModal");
const agreeCheckbox = document.getElementById("agreeCheckbox");
const usernameInput = document.getElementById("usernameInput");
const colorInput = document.getElementById("colorInput");
const joinBtn = document.getElementById("joinBtn");
const usersList = document.getElementById("usersList");
const usersToggle = document.getElementById("usersToggle");
const pauseBtn = document.getElementById("pauseBtn");
const exitBtn = document.getElementById("exitBtn");
const themeToggle = document.getElementById("themeToggle");

/* ===== Consent Logic ===== */
agreeCheckbox.addEventListener("change", () => {
    const enabled = agreeCheckbox.checked;
    usernameInput.disabled = !enabled;
    colorInput.disabled = !enabled;
    joinBtn.disabled = !enabled;
});

joinBtn.addEventListener("click", () => {
    if (!socket.connected) {
        alert("Connecting to server, please try again.");
        return;
    }

    const username = usernameInput.value.trim();
    if (!username) {
        alert("Please enter a username");
        return;
    }

    myUsername = username;
    myColor = colorInput.value;
    hasJoined = true;

    // Update "Me" panel
    document.getElementById("meName").textContent = myUsername;
    document.getElementById("meColor").style.background = myColor;

    modal.style.display = "none";

    socket.emit("user-joined", {
        username: myUsername,
        color: myColor
    });
});

/* ===== Users List ===== */
socket.on("users-update", (users) => {
    if (!socket.id) return;

    usersList.innerHTML = "";

    for (const id in users) {
        if (id === socket.id) continue;

        const user = users[id];

        const userItem = document.createElement("div");
        userItem.className = "user-item";

        if (visibleUsers.has(id)) {
            userItem.classList.add("selected");
        }

        userItem.innerHTML = `
            <span class="color-dot" style="background:${user.color}"></span>
            <span class="username">${user.username}</span>
            <span class="status">${user.status}</span>
        `;

        userItem.addEventListener("click", () => {
            if (visibleUsers.has(id)) {
                visibleUsers.delete(id);

                if (cursors[id]) {
                    cursors[id].remove();
                    delete cursors[id];
                    delete targetPositions[id];
                }

                userItem.classList.remove("selected");
            } else {
                visibleUsers.add(id);
                userItem.classList.add("selected");
            }
        });

        usersList.appendChild(userItem);
    }
});

usersToggle.addEventListener("click", () => {
    usersList.classList.toggle("hidden");
});

/* ===== Cursor Sending (Throttled) ===== */
let lastSentTime = 0;
const THROTTLE_INTERVAL = 50;

document.addEventListener("mousemove", (event) => {
    if (!hasJoined || isPaused) return;

    const now = Date.now();
    if (now - lastSentTime < THROTTLE_INTERVAL) return;
    lastSentTime = now;

    socket.emit("cursor-move", {
        x: event.clientX,
        y: event.clientY
    });
});

/* ===== Cursor Receiving ===== */
socket.on("cursor-update", (data) => {
    if (!visibleUsers.has(data.id)) return;

    let cursor = cursors[data.id];

    if (!cursor) {
        cursor = document.createElement("div");
        cursor.className = "cursor";
        cursor.style.backgroundColor = data.color;
        cursor.title = data.username;
        document.body.appendChild(cursor);
        cursors[data.id] = cursor;

        cursor.style.left = data.x + "px";
        cursor.style.top = data.y + "px";
    }

    targetPositions[data.id] = { x: data.x, y: data.y };
});

socket.on("user-disconnected", (id) => {
    if (cursors[id]) {
        cursors[id].remove();
        delete cursors[id];
        delete targetPositions[id];
    }
});

/* ===== Interpolation ===== */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

function animateCursors() {
    for (const id in cursors) {
        const c = cursors[id];
        const t = targetPositions[id];
        if (!t) continue;

        const x = parseFloat(c.style.left);
        const y = parseFloat(c.style.top);

        c.style.left = lerp(x, t.x, 0.15) + "px";
        c.style.top = lerp(y, t.y, 0.15) + "px";
    }
    requestAnimationFrame(animateCursors);
}
animateCursors();

/* ===== Pause ===== */
pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume Sharing" : "Pause Sharing";
    socket.emit("status-update", isPaused ? "paused" : "active");
});

/* ===== Exit ===== */
exitBtn.addEventListener("click", () => {
    socket.disconnect();

    hasJoined = false;
    isPaused = false;
    myUsername = "";
    myColor = "#ff0000";

    for (const id in cursors) cursors[id].remove();
    Object.keys(cursors).forEach(id => delete cursors[id]);
    Object.keys(targetPositions).forEach(id => delete targetPositions[id]);

    usersList.innerHTML = "";
    pauseBtn.textContent = "Pause Sharing";

    agreeCheckbox.checked = false;
    usernameInput.value = "";
    usernameInput.disabled = true;
    colorInput.value = "#ff0000";
    colorInput.disabled = true;
    joinBtn.disabled = true;

    modal.style.display = "flex";
    socket.connect();
});

/* ===== Theme Toggle ===== */
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
    localStorage.setItem("theme", dark ? "dark" : "light");
});
