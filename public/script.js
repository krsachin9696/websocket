
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let nameSet = false;

    function askForUsername() {
        const name = prompt('Enter your name:');
        if (name) {
            socket.emit('set name', name);
            nameSet = true;
        } else {
            // Retry asking if no name was provided
            askForUsername();
        }
    }

    // Prompt for username immediately on page load
    askForUsername();

    // Handle connection establishment
    socket.on('connect', () => {
        console.log('Connected to the server');
    });

    // Ensure prompt for username if the server requests it
    socket.on('request name', () => {
        if (!nameSet) {
            askForUsername();
        }
    });

    // Send a message
    document.getElementById('sendMessage').addEventListener('click', () => {
        const message = document.getElementById('message').value;
        if (message.trim()) {
            socket.emit('chat message', message);
            document.getElementById('message').value = '';
        }
    });

    // Handle Enter key to send messages
    document.getElementById('message').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('sendMessage').click();
        }
    });

    // Receive chat messages
    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        document.getElementById('messages').appendChild(item);
        document.querySelector('.chat-box').scrollTop = document.querySelector('.chat-box').scrollHeight;
    });

    // Update user list
    socket.on('update users', (userList) => {
        const userUl = document.getElementById('users');
        userUl.innerHTML = '';
        userList.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user;
            userUl.appendChild(li);
        });
    });
});
