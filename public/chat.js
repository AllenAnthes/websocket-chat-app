window.onload = () => {
    const messages = [];
    // const socket = io.connect('http://localhost:4000');
    const socket = io();
    const username = document.getElementById("username");
    const message = document.getElementById("message");
    const chatWindow = document.getElementById("chatWindow");
    const form = document.getElementById("input-form");

    socket.on('message', (data) => {
        if (data.message) {
            const isScrolledToBottom = chatWindow.scrollHeight - chatWindow.clientHeight <= chatWindow.scrollTop + 1;
            messages.push(data);

            chatWindow.innerHTML = messages.map(message => (
                `<b>${message.username ? message.username : 'Server'}:</b> ${message.message}<br/>`
            )).join('');

            // Move the chat window down to the new message if they were previously
            // at the bottom
            if (isScrolledToBottom) {
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }
        } else {
            console.log("Error with received message:", data);
        }
    });

    form.addEventListener("submit", sendMessage);
    chatWindow.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendMessage(event);
        }
    });

    function sendMessage(event) {
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            const text = message.value;
            socket.emit('send', {message: text, username: username.value});
            message.value = '';
        }
        form.classList.add('was-validated');
    }
};