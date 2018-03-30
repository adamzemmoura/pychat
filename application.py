from flask import Flask, render_template, jsonify, json
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_moment import Moment
from datetime import datetime
from models import Message

app = Flask(__name__)
app.config['SECRET_KEY'] = "you will never guess this"
Bootstrap(app)
socketio = SocketIO(app)
moment = Moment(app)

messages_by_room = {
    'Main' : [],
}

@app.route('/', methods=["POST", "GET"])
def index():
    rooms = messages_by_room.keys()
    return render_template('index.html', rooms = rooms)

@socketio.on('message')
def handle_message(msg):
    timestamp = datetime.utcnow()
    send(msg, broadcast=True)

@socketio.on('send message')
def handle_send_message(data):

    timestamp = str(datetime.utcnow()) + 'Z'
    msg = data['message']
    sent_by = str(data['display_name'])
    room = data['room']
    message = Message(timestamp, msg, sent_by)

    if room in messages_by_room:
        messages = messages_by_room[room]
        messages.append(message)
        while len(messages) > 100:
            messages.pop(0) # remove the oldest messages to keep messages < 100
    else:
        messages_by_room[room] = [message]

    emit('broadcast message', {'id': message.get_id(), 'body': message.get_body(), 'author': message.get_author(), 'timestamp': message.get_timestamp() }, room = room, broadcast=True)

@socketio.on('load messages')
def handle_load_messages(data):
    room = data['room']
    messages = messages_by_room[room]
    messagesDict = []
    for message in messages:
        messagesDict.append(message.convert_to_dict())
    jsonStr = json.dumps(messagesDict)
    emit('display all messages', {'messages': jsonStr}, room=room, broadcast=True)

@socketio.on('new channel created')
def handle_new_channel_created(data):
    channelName = data['name']
    if channelName not in messages_by_room.keys():
        messages_by_room[channelName] = []
    allChannels = messages_by_room.keys()
    emit('update channels', {'channels': allChannels}, broadcast=True)

@socketio.on('delete message')
def handle_delete_message(data):
    id = data['id']
    room = data['room']
    for message in messages_by_room[room]:
        if message.get_id() == id:
            messages_by_room[room].remove(message)
    handle_load_messages(data)

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    emit('user joined room', {'username': username, 'room': room}, room = room, broadcast=True)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send(username + ' has left the room.', room=room)
    emit('user left room', {'username': username, 'room': room}, room = room, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)
