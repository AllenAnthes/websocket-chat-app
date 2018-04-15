window.onload = () => {
    const $ = (selector) => document.querySelector(selector);
    const messages = [];
    const socket = io();

    const username = $("#username");
    const message = $("#message");
    const chatWindow = $("#chatWindow");
    const form = $("#input-form");

    /**
     * On receipt of a new message the chat window is populated
     * and scrolled to the bottom if it was previously there.
     */
    socket.on('message', (data) => {
        if (data.message) {
            const isScrolledToBottom = chatWindow.scrollHeight - chatWindow.clientHeight <= chatWindow.scrollTop + 1;
            messages.push(data);

            chatWindow.innerHTML = messages.map(message => (
                `<b>${message.username ? message.username : 'Server'}:</b> ${message.message}<br/>`
            )).join('');

            if (isScrolledToBottom) {
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }

        } else {
            console.log("Error on received message:", data);
        }
    });


    /**
     * Form submission on either send button
     * or enter key press.
     */
    form.addEventListener("submit", sendMessage);
    chatWindow.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendMessage(event);
        }
    });

    /**
     * Sends the message to our server if fields are valid
     *
     * @param event
     */
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