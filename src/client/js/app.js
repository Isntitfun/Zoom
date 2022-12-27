// ============================================================================
// Global Variables

const socket = io();
const peerConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: [
        "stun:nstun.l.google.com:19302",
        "stun:nstun1.l.google.com:19302",
        "stun:nstun2.l.google.com:19302",
        "stun:nstun3.l.google.com:19302",
        "stun:nstun4.l.google.com:19302",
        "stun:nstun01.sipphone.com",
        "stun:nstun.ekiga.net",
        "stun:nstun.fwdnet.net",
        "stun:nstun.ideasip.com",
        "stun:nstun.iptel.org",
        "stun:nstun.rixtelecom.se",
        "stun:nstun.schlund.de",
        "stun:nstunserver.org",
        "stun:nstun.softjoys.com",
        "stun:nstun.voiparound.com",
        "stun:nstun.voipbuster.com",
        "stun:nstun.voipstunt.com",
        "stun:nstun.voxgratia.org",
        "stun:nstun.xten.com",
      ],
    },
  ],
});

const roomForm = document.getElementById("roomForm");
const roomInput = document.getElementById("roomInput");

const videoDisplay = document.getElementById("videoDisplay");
const roomTitle = document.querySelector("#videoDisplay h5");
const myFace = document.getElementById("myFace");
const peerFace = document.getElementById("peerFace");

const controls = document.getElementById("controls");
const camList = document.getElementById("camList");
const muteBtn = document.getElementById("muteBtn");
const camOffbtn = document.getElementById("cameraOff");

const zt = (arg) => {
  console.log("Test::::::::::::::::::::::::::::::::::::::::::");
  console.log(arg);
};

// ============================================================================
// GInitialize

let isMute = false;
let isCamOff = false;
let myStream;
let roomName;

videoDisplay.hidden = true;
controls.hidden = true;

// ============================================================================
// Global Functions

const hideRoom = () => {
  roomForm.hidden = true;
  videoDisplay.hidden = false;
  controls.hidden = false;
};

// ============================================================================
// Media Functions

const getMediaDevice = async () => {
  const allDevices = await navigator.mediaDevices.enumerateDevices();
  console.log(allDevices);
  const videoDevices = allDevices.filter(
    (device) => device.kind === "videoinput"
  );
  videoDevices.forEach((device) => {
    const option = document.createElement("option");
    option.innerText = device.label;
    option.value = device.deviceId;
    camList.appendChild(option);
    if (myStream) {
      if (myStream.getVideoTracks()[0].label === device.label) {
        option.selected = true;
      }
    }
  });
  //   camList.value = myStream.getVideoTracks()[0].label;
};
const openStream = async (deviceId) => {
  if (myStream) {
    myStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  const constraints = {
    audio: true,
    video: { deviceId }
      ? {
          deviceId: {
            exact: deviceId,
          },
        }
      : { facingMode: "user" },
  };
  myStream = await navigator.mediaDevices.getUserMedia(constraints);
  myFace.srcObject = myStream;
};

// ============================================================================
// WebRTC
const initRTC = async () => {
  await openStream();
  myStream.getTracks().forEach((i) => {
    peerConnection.addTrack(i, myStream);
  });
};

socket.on("connect", () => {
  console.log("connected");
});

socket.on("receiver__came", async () => {
  zt("receiver came heard");
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", async (answer) => {
  await peerConnection.setRemoteDescription(answer);
});

socket.on("ice", async (ice) => {
  await peerConnection.addIceCandidate(ice);
  zt("Ice added");
});

// ============================================================================
// Event Handlers

const handleMuteClick = () => {
  const audioStream = myStream.getAudioTracks()[0];
  audioStream.enabled = !audioStream.enabled;

  if (!isMute) {
    muteBtn.innerText = "Unmute";
    isMute = true;
  } else {
    muteBtn.innerText = "Mute";
    isMute = false;
  }
};
const handleCamOffClick = () => {
  const videoStream = myStream.getVideoTracks()[0];
  videoStream.enabled = !videoStream.enabled;

  if (!isCamOff) {
    camOffbtn.innerText = "Camera On";
    isCamOff = true;
  } else {
    camOffbtn.innerText = "Camera Off";
    isCamOff = false;
  }
};
const handleCamChange = async () => {
  await openStream(camList.value);
  const obsoleteTracks = peerConnection.getSenders();
  const updatedVideoTracks = myStream.getVideoTracks()[0];
  const updatedAudioTracks = myStream.getAudioTracks()[0];
  obsoleteTracks.forEach((sender) => {
    if (sender.track.kind === "video") {
      sender.replaceTrack(updatedVideoTracks);
    } else if (sender.track.kind === "audio") {
      sender.replaceTrack(updatedAudioTracks);
    }
  });
};
const handleRoomEnter = async (event) => {
  event.preventDefault();
  roomName = roomInput.value;
  roomTitle.innerText = roomName;
  roomInput.value = "";
  getMediaDevice();
  hideRoom();
  await initRTC();
  socket.emit("enter__room", roomName);
  zt("enter__room fired");
};
const handleIce = (event) => {
  socket.emit("ice", event.candidate, roomName);
};
const handleStream = (event) => {
  const [remoteStream] = event.streams;
  console.log(remoteStream);
  peerFace.srcObject = remoteStream;
};

// ============================================================================
// Event Listeners

muteBtn.addEventListener("click", handleMuteClick);
cameraOff.addEventListener("click", handleCamOffClick);
camList.addEventListener("change", handleCamChange);
roomForm.addEventListener("submit", handleRoomEnter);
peerConnection.addEventListener("icecandidate", handleIce);
peerConnection.addEventListener("track", handleStream);
