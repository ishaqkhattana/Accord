const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
//Get info from url IMP
const { username } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

socket.emit('joinRoom', { username })

//Get users from server
socket.on('users', (users) => {
    outputUsers(users);
})

//Message from server
socket.on('message', message => {
    outputMessage(message);

    //scroll down everytime we get message
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('privateMessage', message => {
    outputPrivateMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message sent listener

chatForm.addEventListener('submit', e => {
    e.preventDefault();
    //Getting value of the message field
    const msg = e.target.elements.msg.value;
    //Emitting the extracted message
    if(!msg.startsWith("/w")){
        socket.emit('chatMessage', msg);
    }
    else {
        const pm = msg.substr(3+clickedUser.length,msg.length);
        var msgParts = msg.split(" ");
        socket.emit('privateMessage', {
            msg: pm,
            sender: socket.id,
            reciever: msgParts[1]
        });
    }

    //clear the input field after every msg
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

var clickedUser;

userList.addEventListener("click", function(e) {
    console.log(e);
    if (e.target && e.target.matches("li")) {
        const whisperString = "/w " + e.target.innerHTML;
        clickedUser = e.target.innerHTML;
        document.getElementById("msg").value = whisperString+' ';
        document.getElementById("msg").focus();


        //socket.to(socket.id).emit('privateMessage',)
    }
})


//Function to output message to DOM

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    console.log(message.text);
    div.innerHTML = `<p class = 'meta'>${message.username} <p class = text> ${message.text} </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

function outputPrivateMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class = 'meta'>Private Message From: ${message.username} <p class = text> ${message.text} </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}