const socket = io()
const form = document.getElementById('send-container')
const messageInput = document.getElementById('messageinp')
const messageContainer = document.querySelector(".container")
var audio=new Audio('../media/New_Member_Joined.mp3')
var audio_message=new Audio('../media/New_Message.mp3')
const append=(message,position)=>{
    const messageElement=document.createElement('div')
    messageElement.innerHTML = message;
    
    messageElement.classList.add('message')
    messageElement.classList.add(position)
    messageContainer.append(messageElement)
}
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message=messageInput.value;
    
    append(`You: ${message}`,'right');
    socket.emit('send',message);
    messageInput.value=''
})
const name='Rishik'
socket.emit('new-user-joined', name)
socket.on('user-joined',name => {
append(`<span class="user">${name}</span> joined the chat`,'right')
audio.play()
})
socket.on('receive',data => {
    append(`<span class="user">${data.name}</span> : ${data.message}`,'left')
    audio_message.play()
    })
socket.on('left',name=> {
        append(`${name} left the chat`,'left')
        audio.play()
        })