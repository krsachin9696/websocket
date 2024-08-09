document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  let nameSet = false;

  function askForUsername() {
    const name = prompt('Enter your name:');
    if (name) {
      socket.emit('set name', name);
      nameSet = true;
    } else {
      askForUsername();
    }
  }

  askForUsername();

  socket.on('connect', () => {
    console.log('Connected to the server');
  });

  socket.on('request name', () => {
    if (!nameSet) {
      askForUsername();
    }
  });

  document.getElementById('sendMessage').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    const recipient = document.getElementById('userSelect').value;

    if (message.trim()) {
      if (recipient) {
        socket.emit('private message', { message, recipient });
      } else {
        socket.emit('chat message', message);
      }
      document.getElementById('message').value = '';
    }
  });

  document.getElementById('message').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('sendMessage').click();
    }
  });

  socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    document.getElementById('messages').appendChild(item);
    document.querySelector('.chat-box').scrollTop =
      document.querySelector('.chat-box').scrollHeight;
  });

  socket.on('private message', ({ message, sender }) => {
    const item = document.createElement('li');
    item.textContent = `Private from ${sender}: ${message}`;
    document.getElementById('messages').appendChild(item);
    document.querySelector('.chat-box').scrollTop =
      document.querySelector('.chat-box').scrollHeight;
  });

  socket.on('update users', (userList) => {
    const userUl = document.getElementById('users');
    const userSelect = document.getElementById('userSelect');
    userUl.innerHTML = '';
    userSelect.innerHTML = '<option value="">Select User</option>';

    userList.forEach((user) => {
      const li = document.createElement('li');
      li.textContent = user;
      userUl.appendChild(li);

      const option = document.createElement('option');
      option.value = user;
      option.textContent = user;
      userSelect.appendChild(option);
    });
  });
});
