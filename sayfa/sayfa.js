const socket = io();
const userlist = new Map();
let loggedIn = false;
let currentUser = null;

// Sayfa yenilendiğinde oturumu kontrol etmek için
document.addEventListener('DOMContentLoaded', function() {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
        loggedIn = true;
        currentUser = storedUsername;
        refresh(); // Oturum açıkken chat ekranını göster
        socket.emit('user connected', storedUsername);
    }
});

function refresh() {
    document.getElementById('registerContainer').classList.remove('active');
    document.getElementById('registerContainer').classList.add('inactive');
    document.getElementById('loginContainer').classList.remove('active');
    document.getElementById('loginContainer').classList.add('inactive');
    document.getElementById('chatContainer').classList.remove('inactive');
    document.getElementById('chatContainer').classList.add('active');
}

function login() {
    const usernameInput = document.getElementById('logUsername');
    const passwordInput = document.getElementById('logPassword');
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username && password) {
        if (userlist.has(username) && userlist.get(username) === password) {
            loggedIn = true;
            currentUser = username;
            sessionStorage.setItem('username', username); // Oturumu sessionStorage'a kaydet
            refresh(); // Chat ekranını göster
            socket.emit('user connected', username);
        }
        else if(!userlist.has(username)){
            alert('Kullanici sisteme kayitli degil.');
        }
        else {
            alert('Yanlış kullanıcı adı veya şifre');
        }
    } else {
        alert('Lütfen kullanıcı adı ve şifre girin');
    }
    usernameInput.value='';
    passwordInput.value='';
}

function register() {
    const usernameInput = document.getElementById('regUsername');
    const passwordInput = document.getElementById('regPassword');
    const username = usernameInput.value;
    const password = passwordInput.value;

    if(userlist.has(username)){
        alert('Kullanici zaten sisteme kayitli.');
    }
    else{
        if (username && password) {
            userlist.set(username, password);
            console.log(userlist.get(username));
            document.getElementById('registerContainer').classList.remove('active');
            document.getElementById('registerContainer').classList.add('inactive');
            document.getElementById('loginContainer').classList.remove('inactive');
            document.getElementById('loginContainer').classList.add('active');
            alert("Kullanıcı oluşturuldu.");
        } else {
            alert('Lütfen kullanıcı adı ve şifre girin');
        }
    }

    usernameInput.value = '';
    passwordInput.value = '';
}

function backtoLog() {
    document.getElementById('registerContainer').classList.remove('active');
    document.getElementById('registerContainer').classList.add('inactive');
    document.getElementById('loginContainer').classList.remove('inactive');
    document.getElementById('loginContainer').classList.add('active');
}

function backtoReg() {
    document.getElementById('loginContainer').classList.remove('active');
    document.getElementById('loginContainer').classList.add('inactive');
    document.getElementById('registerContainer').classList.remove('inactive');
    document.getElementById('registerContainer').classList.add('active');
}

function logOut() {
    loggedIn = false;
    sessionStorage.removeItem('username'); // sessionStorage'dan oturumu kaldır
    document.getElementById('loginContainer').classList.add('active');
    document.getElementById('loginContainer').classList.remove('inactive');
    document.getElementById('chatContainer').classList.add('inactive');
    document.getElementById('chatContainer').classList.remove('active');
    socket.emit('user disconnected',currentUser);
    currentUser = null;
}



function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    if (message) {
        socket.emit('chat message', { username: currentUser, message }); // Kullanıcı adını da gönder
        messageInput.value = '';
    }
}

socket.on('user connected', function(data) {
    sessionStorage.setItem('userId', data.userId);
});

socket.on('chat message', function(data) {
    const chatMessages = document.getElementById('chatMessages');
    const newMessage = document.createElement('div');
    newMessage.textContent = `${data.username}: ${data.message}`;

    const storedUserId = sessionStorage.getItem('userId');
    if (data.userId && data.userId === storedUserId) {
        newMessage.classList.remove('other-message');
        newMessage.classList.add('my-message');
    } else {
        newMessage.classList.remove('my-message');
        newMessage.classList.add('other-message');
    }

    chatMessages.appendChild(newMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
