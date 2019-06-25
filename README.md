# Project 2

Web Programming with Python and JavaScript

---
## Overview

For this project I built a simple chat app using Flask and SocketIO.  The app supports multiple channels and "remembers" the user between sessions.

---
## Requirements

1. **Display Name: When a user visits your web application for the first time, they should be prompted to type in a display name that will eventually be associated with every message the user sends. If a user closes the page and returns to your app later, the display name should still be remembered.**

   As part of the setup the app calls updateDisplay(), which checks to see if there the displayName property is null or not.  If the displayName proprety is not null, then a user is still logged in - there is a displayName stored in local storage.  If a user is not logged in, a form is presented asking the user to enter a display name.  If the user is logged in, the chatroom is displayed with a welcome message at the top showing the current room and the display name.

2. **Channel List: Users should be able to see a list of all current channels, and selecting one should allow the user to view the channel. We leave it to you to decide how to display such a list.**

   The list of channels on the left hand side of the chat app.  They are all clickable buttons.  When a channel button is clicked, the messages for that channel appear in the display and the welcome message changes to reflect the current room. There is no limit to the number of channels and once there are more than fits on the screen, the channel list becomes scrollable.

3. **Messages View: Once a channel is selected, the user should see any messages that have already been sent in that channel, up to a maximum of 100 messages. Your app should only store the 100 most recent messages per channel in server-side memory.**

   When the user clicks a channel, the messages stored server-side for that channel are displayed.  When new messages are added, if the there are more 100 messages associated with the channel, the oldest messages are removed.  No individual channel stores more than 100 messages.

4. **Sending Messages: Once in a channel, users should be able to send text messages to others the channel. When a user sends a message, their display name and the timestamp of the message should be associated with the message. All users in the channel should then see the new message (with display name and timestamp) appear on their channel page. Sending and receiving messages should NOT require reloading the page.**

   When a user sends a message either by hitting return or clicking the send button after typing a message into the message input, the message is added to the sever-side storage and emitted for all users connected to the channel/room to see.  Reloading of the page is not required.

5. **Remembering the Channel: If a user is on a channel page, closes the web browser window, and goes back to your web application, your application should remember what channel the user was on previously and take the user back to that channel.**

   The users last room is kept in local storage.  Each time the joinRoom() function is called, this is updated.  When the app loads, setupInitialRoom() is called to check if there was a last room.  If not, the default room 'Main' is joined.  

6. **Personal Touch: Add at least one additional feature to your chat application of your choosing! Feel free to be creative, but if you’re looking for ideas, possibilities include: supporting deleting one’s own messages, supporting use attachments (file uploads) as messages, or supporting private messaging between two users.**

   The app supports the ability to delete your own messages.  To delete your messages you simply double click on the message, which presents a confirmation box to make sure you really want to delete the message.  Once deleted, this updates both on the server and on all connected clients without reloading the page ie. close to realtime.  If you try to delete a message for which you are not the author, it will not allow you.  You can only delete messages you wrote.
