// API Configuration
const API_URL = 'http://localhost:3000/api/v1'; 

// --- STATE MANAGEMENT (Extra Credit) ---
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// --- APP LOGIC ---
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const authMessage = document.getElementById('authMessage');

window.addEventListener('load', () => {
    const token = getCookie('authToken');
    if (token) {
        showApp();
        fetchTodos();
    }
});

function showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
    
    if (tab === 'login') {
        document.getElementById('loginForm').classList.remove('hidden');
        document.querySelector('button[onclick="showTab(\'login\')"]').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.remove('hidden');
        document.querySelector('button[onclick="showTab(\'register\')"]').classList.add('active');
    }
    authMessage.textContent = '';
}

// --- AUTHENTICATION ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            setCookie('authToken', data.token, 1);
            showApp();
            fetchTodos();
        } else {
            authMessage.textContent = data.message || 'Login failed';
        }
    } catch (err) {
        authMessage.textContent = 'Server error. Is the backend running?';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const res = await fetch(`${API_URL}/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        if (res.ok) {
            alert('Registration successful! Please login.');
            showTab('login');
        } else {
            const data = await res.json();
            authMessage.textContent = data.message || 'Registration failed';
        }
    } catch (err) {
        authMessage.textContent = 'Server error. Is the backend running?';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    deleteCookie('authToken');
    location.reload();
});

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
}

// --- TODO LIST OPERATIONS ---
async function fetchTodos() {
    const token = getCookie('authToken');
    const res = await fetch(`${API_URL}/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const todos = await res.json();
    renderTodos(todos);
}

function renderTodos(todos) {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        if (todo.isComplete) li.classList.add('completed');
        
        li.innerHTML = `
            <div>
                <strong>${todo.title}</strong><br>
                <small>${todo.description || ''}</small>
            </div>
            <div class="actions">
                <button class="btn-sm btn-check" onclick="toggleTodo('${todo._id}', ${!todo.isComplete})">✓</button>
                <button class="btn-sm btn-del" onclick="deleteTodo('${todo._id}')">✕</button>
            </div>
        `;
        list.appendChild(li);
    });
}

document.getElementById('addBtn').addEventListener('click', async () => {
    const title = document.getElementById('newTitle').value;
    const description = document.getElementById('newDesc').value;
    const token = getCookie('authToken');

    if (!title) return;

    await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
    });

    document.getElementById('newTitle').value = '';
    document.getElementById('newDesc').value = '';
    fetchTodos();
});

async function toggleTodo(id, status) {
    const token = getCookie('authToken');
    await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isComplete: status })
    });
    fetchTodos();
}

async function deleteTodo(id) {
    const token = getCookie('authToken');
    await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchTodos();
}