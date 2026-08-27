const API_BASE_URL = "http://localhost:3000";

async function apiRequest(url, method = "GET", data = null) {
    const options = { method };
    if (data !== null && method !== "GET") {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    if (method === "DELETE") return true;
    return response.json();
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem("loggedInUser");
}

function showToast(icon, message) {
    Swal.fire({ toast:true, position:"top-end", icon, title:message, showConfirmButton:false, timer:2500 });
}

function formatDate(date) {
    return new Date(date).toISOString().split("T")[0];
}

function formatDisplayDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

function initTheme(toggleId = "themeToggle", iconId = "themeIcon") {
    const body = document.body;
    const toggle = document.getElementById(toggleId);
    const icon = document.getElementById(iconId);
    if (!toggle) return;
    const saved = localStorage.getItem("theme") || "dark";
    body.classList.toggle("light-mode", saved === "light");
    if (icon) icon.className = saved === "light" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    toggle.addEventListener("click", () => {
        const light = body.classList.toggle("light-mode");
        localStorage.setItem("theme", light ? "light" : "dark");
        if (icon) icon.className = light ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
}

function setupLogout(buttonId = "logoutBtn") {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.addEventListener("click", async () => {
        const result = await Swal.fire({ title:"Logout?", text:"You will be redirected to login page", icon:"question", showCancelButton:true, confirmButtonColor:"red", confirmButtonText:"Logout" });
        if (result.isConfirmed) {
            clearSession();
            window.location.href = "login.html";
        }
    });
}
