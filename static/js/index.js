document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure send button
    socket.on('connect', () => {
        console.log("connected to socket")
        // The button should emit a "submit message" event
        document.getElementById('send-button').onclick = () => {
          const message = document.getElementById('message');
          console.log(`form submitted with message: ${message.value}`)
          socket.emit('submit message', {'message': message.value});
        }
    })

    // When a new message is broadcast, add to the unordered list
    socket.on('broadcast message', data => {
        console.log("message was broadcast")
        const li = document.createElement('li');
        li.innerHTML = `Message: ${data.message}`;
        document.querySelector('#messages').append(li);
    });
});
