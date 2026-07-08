const form = document.getElementById('loginForm') as HTMLFormElement;
const messageBox = document.getElementById('loginMessage') as HTMLDivElement;

form.addEventListener('submit', (e: Event) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    if (username && password) {
        messageBox.textContent = `Welcome, ${username}! (demo login)`;
        messageBox.style.color = '#4f46e5';
    } else {
        messageBox.textContent = 'Please fill in both fields.';
        messageBox.style.color = '#dc2626';
    }
});