document.addEventListener('DOMContentLoaded', function() {

  var socket = io.connect('http://' + document.domain + ':' + location.port);

  const displayName_key = 'username' // key for local storage
  const usersLastRoom_key = 'currentRoom'
  const chatWindow = document.getElementById('chat-window')
  const signinButton = document.getElementById('signin-btn')
  const logoutButton = document.getElementById('logout-btn')
  const loginForm = document.getElementById('login-form')
  const loginButton = document.getElementById('login-btn')
  const loginContainer = document.getElementById('login-container')
  const chatAppContainer = document.getElementById('chatapp-container')
  const chatAppLeftSide = document.getElementById('left-side')
  const chatAppRightSide = document.getElementById('right-side')
  const newChannelButton = document.getElementById('new-channel-btn')
  const messages = document.getElementById('messages')
  const channelMenu = document.getElementsByClassName('channel-menu')[0]
  const messageDisplay = document.getElementsByClassName('message-display')[0]
  const statusUpdates = document.getElementById('status-updates')

  let displayName = localStorage.getItem(displayName_key)
  let currentRoom = null

  setupInitalRoom()
  setupChatDisplay()
  setupLoginForm()
  updateDisplay()

  function joinRoom(room = "Main") {
    currentRoom = room
    localStorage.setItem(usersLastRoom_key, currentRoom)
    socket.emit('join', {'room': currentRoom, 'username': displayName})
    socket.emit('load messages', {'room': currentRoom})
  }

  function leaveRoom() {
    socket.emit('leave', {'room': currentRoom, 'username': displayName})
    currentRoom = null
    localStorage.removeItem(usersLastRoom_key)
    clearMessages()
  }

  function clearMessages() {
    messages.innerHTML = ""
  }

  function changeRoom(room) {
    leaveRoom()
    joinRoom(room)
    setWelcomeMessage()
  }

  function updateDisplay() {
    if (displayName) {
      loginForm.className = 'hidden'
      chatAppContainer.className = 'chat-container'
      chatAppLeftSide.className = ''
      chatAppRightSide.className = ''
    } else {
      chatAppLeftSide.className = 'hidden'
      chatAppRightSide.className = 'hidden'
      chatAppContainer.className = 'chat-container center-align-content'
      loginForm.className = ''
    }
    setWelcomeMessage()
  }

  function setupInitalRoom() {
    const lastRoom = localStorage.getItem(usersLastRoom_key)
    if (lastRoom) {
      joinRoom(lastRoom)
    } else {
      joinRoom()
    }
  }

  function setupLoginForm() {

    loginForm.onsubmit = () => {
      const possibleDisplayName = document.getElementById('display-name').value
      if (possibleDisplayName.length > 0) {
        displayName = possibleDisplayName
        localStorage.setItem(displayName_key, displayName)

        setupInitalRoom()

        updateDisplay()
      } else {
        loginWarningMessage("You did not enter a display name")
      }

      return false
    }
  }

  function setupChannelButtons() {
    const channelButtons = channelMenu.children
    for (i = 0; i < channelButtons.length; i++) {
      const button = channelButtons[i]
      const channelName = button.value
      button.onclick = () => {
        changeRoom(channelName)
      }
    }
  }

  function setupChatDisplay() {
    setupLogoutButton()
    setupSendMessageButton()
    setupNewChannelButton()
    setupChannelButtons()
  }

  function setupLogoutButton() {
    // when the logout button is clicked, remove the current username from local storage
    logoutButton.onclick = () => {
      if (displayName) {
        socket.emit('leave', {'username': displayName, 'room': currentRoom})
        localStorage.removeItem(displayName_key)
        displayName = null
        leaveRoom()
        updateDisplay()
      }
    }
  }

  function setupSendMessageButton() {
    // when the message send button clicked, send message to server
    document.getElementById('chat-input').onsubmit = function() {
      const messageInput = document.getElementById('message')
      const message = messageInput.value
      messageInput.value = ''
      socket.emit('send message', {'room': currentRoom, 'display_name': displayName, 'message': message})
      return false
    }
  }

  // sets up the button + button at the top of channel menu
  function setupNewChannelButton() {
    // when a new chat channel button clicked, create a new channel on socketio
    newChannelButton.onclick = () => {
      const rooms = channelMenu.children
      const newRoomName = prompt("Please enter the name of the channel : ")

      // check to see if room name already exists
      let nameAlreadyTaken = false

      for (i = 0; i < rooms.length; i++) {
        const name = rooms[i].value.toLowerCase().trim()
        if (name === newRoomName.toLowerCase().trim()) nameAlreadyTaken = true
      }

      if (newRoomName.length > 0) {
        if (!nameAlreadyTaken) {
          createNewChannelButton(newRoomName)
          changeRoom(newRoomName)
          socket.emit('new channel created', {'name': newRoomName})
        } else {
          alert("That name is already taken, please choose another name.")
        }
      } else {
        alert("You did not enter a name for the channel")
      }
    }
  }

  function clearChannelMenu() {
    channelMenu.innerHTML = ""
  }

  function fadeout(target) {

    let effect = setInterval(function () {
        if (!target.style.opacity) {
            target.style.opacity = 1;
        }
        if (target.style.opacity < 0.1) {
            clearInterval(effect);
        } else {
            target.style.opacity -= 0.1;
        }
    }, 200);
  }  

  // creates a new channel button and adds it to the channel menu
  function createNewChannelButton(name) {
    const newChannelButton = document.createElement('button')
    newChannelButton.value = name
    newChannelButton.innerHTML = name
    newChannelButton.onclick = () => {
      changeRoom(name)
    }
    channelMenu.append(newChannelButton)
  }


  function loginWarningMessage(msg) {
    const warningMessage = document.getElementById('warning-message')
    warningMessage.innerHTML = msg
    warningMessage.className = 'visible padding-10 red'

  }

  function setWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message')
    const message = displayName ? `Welcome to the ${currentRoom} Room ${displayName},` : `Howdy Stranger,`
    welcomeMessage.innerHTML = message
  }

  function createNewMessage(messageJSON) {

    const body = messageJSON['body']
    const timestamp = messageJSON['timestamp']
    const sentBy = messageJSON['author']
    const messageId = messageJSON['id']
    const author = messageJSON['author']

    const messageLi = document.createElement('li')
    const timestampLi = document.createElement('li')

    messageLi.innerHTML = `${sentBy} : ${body}`
    messageLi.className = 'message'
    timestampLi.innerHTML = moment(timestamp).calendar()
    timestampLi.className = 'black'

    // if a user double clicks on a message, the message should be deleted
    messageLi.ondblclick = () => {
      // only allow users to delete their own messages
      if (displayName === author) {
        if (confirm("Are you sure you want to delete the message?")) {
          socket.emit('delete message', {'id': messageId, 'room': currentRoom})
        }
      }
    }

    messages.append(messageLi)
    messages.append(timestampLi)

    // autoscroll to the bottom after new message added
    messageDisplay.scrollTop = messageDisplay.scrollHeight - messageDisplay.clientHeight
  }

  socket.on('update channels', function(data) {
    const channels = data['channels']
    clearChannelMenu()
    channels.map(channel => { createNewChannelButton(channel) })
    setupChannelButtons()
  })

  socket.on('user joined room', function(data) {
    username = data['username']
    room = data['room']
    if (username !== null && displayName !== username) statusUpdates.innerHTML = `${username} joined ${room}.`
  })

  socket.on('user left room', function(data) {
    username = data['username']
    room = data['room']
    if (username !== null && displayName !== username) statusUpdates.innerHTML = `${username} left ${room}.`
  })

  socket.on('display all messages', function(data) {
    clearMessages()
    const messages = JSON.parse(data['messages'])
    messages.map(message => { createNewMessage(message) })
  })

  socket.on('broadcast message', function(data) {
    createNewMessage(data)
  })

})
