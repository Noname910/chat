const firebaseConfig = {
  apiKey: "AIzaSyDxQIX3dLLYOp6lWa9kEAa1legZW-W2lpk",
  authDomain: "chatapp-9274d.firebaseapp.com",
  databaseURL: "https://chatapp-9274d-default-rtdb.firebaseio.com",
  projectId: "chatapp-9274d",
  storageBucket: "chatapp-9274d.appspot.com",
  messagingSenderId: "840477271165",
  appId: "1:840477271165:web:db3ad0f4fc45c0478a7d14"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentUser = "";
let currentRoom = "global";

function login() {
  const username = document.getElementById("usernameInput").value.trim();
  const room = document.getElementById("roomInput").value.trim();
  if (username) {
    currentUser = username;
    if (room) currentRoom = room;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("chatScreen").style.display = "block";
    document.getElementById("userDisplay").textContent = `user: ${currentUser}`;
    document.getElementById("roomDisplay").textContent = `Room ID: ${currentRoom}`;
    listenForMessages();
    listenForTyping();
  }
}

function sendMessage() {
  const msgInput = document.getElementById("messageInput");
  const text = msgInput.value.trim();
  if (text) {
    const messageData = {
      user: currentUser,
      text: text,
      time: new Date().toLocaleString(),
      id: Date.now()
    };
    database.ref(`${currentRoom}/messages`).push(messageData);
    msgInput.value = "";
    setTyping(false);
  }
}

function listenForMessages() {
  const box = document.getElementById("chatBox");
  database.ref(`${currentRoom}/messages`).on("child_added", (snapshot) => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.className = "message " + (msg.user === currentUser ? "mine" : "others");
    div.innerHTML = `<strong>${msg.user}</strong><br>${msg.text}<br><small>${msg.time}</small>`;
    if (msg.user === currentUser) {
      div.onclick = () => {
        if (confirm("Do you want to delete the message?")) {
          snapshot.ref.remove();
          div.remove();
        }
      };
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  });
}

function typingNow() {
  setTyping(true);
  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => setTyping(false), 2000);
}

let typingTimeout;
function setTyping(state) {
  database.ref(`${currentRoom}/typing`).set(state ? currentUser : "");
}

function listenForTyping() {
  const indicator = document.getElementById("typingIndicator");
  database.ref(`${currentRoom}/typing`).on("value", (snapshot) => {
    const typingUser = snapshot.val();
    indicator.textContent = (typingUser && typingUser !== currentUser) ? `${typingUser} typing...` : "";
  });
}
