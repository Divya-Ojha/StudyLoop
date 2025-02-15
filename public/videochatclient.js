const socket = io("http://localhost:3000");
const videoGrid = document.getElementById("video-grid");
//const name = prompt("Enter your name to join: ");
const name="a"
const mypeer = new Peer(undefined, {
    host: location.hostname,
    port: location.port || 3000,
    path: "/peerjs",
});

const myvideo = document.createElement("video")
myvideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(myvideo, stream)
    //answer the call
    console.log("Incoming call")
    mypeer.on('call', call => {
        console.log("Incoming call from:", call.peer);
        call.answer(stream)
        const video = document.createElement("video")
        console.log("Call object created:", call)
        call.on('stream', userVideoStream => {
            console.log("Receiving stream from:", call.peer);
            addVideoStream(video, userVideoStream)
            console.log("Call received")
        })
    })
    socket.on("video-new-user-joined", (roomId, name, userId) => {
        console.log(`New User Joined: ${name}, ID: ${userId}, Room: ${roomId}`)
        connectToNewUser(userId, stream)
    })
})
mypeer.on('call', call => {
    console.log("📞 Incoming call from:", call.peer);
    navigator.mediaDevices.getUserMedia({
        video: true,
    }).then(stream => {
        call.answer(stream);
        console.log("✅ Answered call from:", call.peer);

        const video = document.createElement("video");
        call.on('stream', userVideoStream => {
            console.log("📡 Receiving stream from:", call.peer);
            addVideoStream(video, userVideoStream);
        });

        call.on("error", err => {
            console.error(`❌ Error during call from ${call.peer}:`, err);
        });

        call.on("close", () => {
            console.log(`🔴 Call closed from ${call.peer}`);
            video.remove();
        });
    }).catch(err => {
        console.error("❌ Error accessing media devices:", err);
    });
});
socket.on("video-user-disconnected", userId => {
    if (peers[userId]) {
        peers[userId].close();
        delete peers[userId];
    }
})
mypeer.on("open", (userId) => {
    console.log(`PeerJS connected. My ID: ${userId}`);
    socket.emit("join-room", ROOM_ID, userId, name)
})
mypeer.on("error", (err) => {
    console.error("PeerJS error: ", err);
})

function connectToNewUser(userId, stream) {
    console.log(`Attempting to connect with ${userId}`)
    const call = mypeer.call(userId, stream)
    if (!call) {
        console.error(`Failed to establish a call with ${userId}`);
        return;
    }
    const video = document.createElement("video")
    console.log("Call object created:", call)
    call.on('stream', userVideoStream => {
        console.log("Connected to user: ", userId);
        addVideoStream(video, userVideoStream)
        console.log("Connecting to user: ", userId)
    })

    call.on('close', () => {
        video.remove()
    })
    peers[userId] = call
}
function addVideoStream(video, stream) {
    console.log(stream)
    video.srcObject = stream
    video.addEventListener("loadedmetadata", () => {
        console.log("Video metadata loaded, starting playback.")
        video.play()
    })
    videoGrid.append(video)
}
