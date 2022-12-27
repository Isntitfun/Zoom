// ==============================================================
// Global Variable
const socket = io();

const nicknameForm = document.getElementById("nicknameForm");
const nicknameInput = document.getElementById("nicknameInput");

const roomForm = document.getElementById("roomForm");
const roomInput = document.getElementById("roomInput");
const roomDisplay = document.getElementById("roomDisplay");

const messageForm = document.getElementById("messageForm");
const currentRoom = document.getElementById("currentRoom");
const messageInput = document.getElementById("messageInput");
const messageDisplay = document.getElementById("messageDisplay");

const control = document.getElementById("control");
const changeNickname = document.getElementById("changeNickname");
const exitRoom = document.getElementById("exitRoom");

const ztest = (context) => {
  console.log(`TEST: ${context}`);
};

// ==============================================================
// Initialize

messageForm.hidden = true;
roomForm.hidden = true;
control.hidden = true;

// ==============================================================
// Global Function

const showRoom = (nickname, rooms) => {
  nicknameForm.hidden = true;
  roomForm.hidden = false;
  messageForm.hidden = true;
  control.hidden = false;
  changeNickname.hidden = false;
  exitRoom.hidden = true;
  roomForm.querySelector(
    "h3"
  ).innerText = `Hello ${nickname}, create a room or join in an existing one.`;
  updateRoom(rooms);
};

const showMessage = (roomName) => {
  messageDisplay.innerHTML = "";
  messageDisplay.style.display = "grid";
  messageDisplay.style.alignContent = "end";
  messageDisplay.style.alignItems = "end";
  messageDisplay.style.overflow = "scroll";
  messageDisplay.style.height = "30vh";
  nicknameForm.hidden = true;
  roomForm.hidden = true;
  messageForm.hidden = false;
  control.hidden = false;
  changeNickname.hidden = false;
  exitRoom.hidden = false;
  currentRoom.innerText = roomName;
  roomInput.value = "";
};

const updateRoom = (rooms) => {
  roomDisplay.innerHTML = "";
  const addRoom = (roomName) => {
    const newRoom = document.createElement("div");
    newRoom.innerText = roomName;
    roomDisplay.appendChild(newRoom);
  };
  rooms.forEach((i) => {
    addRoom(i);
  });
};

const addMessage = (user, msg) => {
  const newMessage = document.createElement("div");
  newMessage.innerText = `${user}: ${msg}`;
  messageDisplay.appendChild(newMessage);
  messageInput.value = "";
};

const addAlert = (user, msg) => {
  const newAlert = document.createElement("div");
  newAlert.innerText = `${user} ${msg}`;
  newAlert.style.backgroundColor = "black";
  newAlert.style.color = "white";
  messageDisplay.appendChild(newAlert);
};

const refreshNickname = (nickname) => {
  nicknameForm.hidden = true;
  roomForm.querySelector(
    "h3"
  ).innerText = `Hello ${nickname}, create a room or join in an existing one.`;
};

// ==============================================================
// SocketIO Listeners

socket.on("connect", () => {
  console.log("Connected");
});

socket.on("Update_Room", (rooms) => {
  updateRoom(rooms);
});

socket.on("Add_Message", (user, msg) => {
  addMessage(user, msg);
});

socket.on("Add_Alert", (user, msg) => {
  addAlert(user, msg);
});

// ==============================================================
// SocketIO Emitters

const emitSetNickname = () => {
  socket.emit("Set_Nickname", nicknameInput.value, showRoom);
};
const emitChangeNickname = (event) => {
  event.preventDefault();
  socket.emit("Change_Nickname", nicknameInput.value, refreshNickname);
};
const emitRoomEnter = () => {
  socket.emit("Enter_Room", roomInput.value, showMessage);
};
const emitSendMessage = () => {
  const roomName = currentRoom.innerText;
  socket.emit("Send_Message", messageInput.value, roomName, addMessage);
};
const emitRoomExit = () => {
  const roomName = currentRoom.innerText;
  socket.emit("Exit_Room", roomName, showRoom);
};

// ==============================================================
// Event Handling

const handleNicknameSet = (event) => {
  event.preventDefault();
  emitSetNickname();
};

const handleRoomEnter = (event) => {
  event.preventDefault();
  emitRoomEnter();
};

const handleSendMessage = (event) => {
  event.preventDefault();
  emitSendMessage();
};

nicknameForm.addEventListener("submit", handleNicknameSet);
roomForm.addEventListener("submit", handleRoomEnter);
messageForm.addEventListener("submit", handleSendMessage);

changeNickname.addEventListener("click", () => {
  nicknameForm.hidden = false;
  nicknameForm.removeEventListener("submit", handleNicknameSet);
  nicknameForm.addEventListener("submit", emitChangeNickname);
});
exitRoom.addEventListener("click", emitRoomExit);
