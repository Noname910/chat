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

// عند تحميل الصفحة، حاول استرجاع الاسم المحفوظ
window.onload = () => {
  const savedName = localStorage.getItem("chat_username");
  if (savedName) {
    document.getElementById("usernameInput").value = savedName;
  }
};

// تسجيل الدخول
function login() {
  const username = document.getElementById("usernameInput").value.trim();
  const room = document.getElementById("roomInput").value.trim();
  if (username) {
    currentUser = username;
    localStorage.setItem("chat_username", currentUser); // حفظ الاسم
    if (room) currentRoom = room;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("chatScreen").style.display = "block";
    document.getElementById("userDisplay").textContent = `المستخدم: ${currentUser}`;
    document.getElementById("roomDisplay").textContent = `الغرفة: ${currentRoom}`;
    listenForMessages();
    listenForTyping();
  }
}

// إرسال رسالة
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

// الاستماع للرسائل
function listenForMessages() {
  const box = document.getElementById("chatBox");
  database.ref(`${currentRoom}/messages`).on("child_added", (snapshot) => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.className = "message " + (msg.user === currentUser ? "mine" : "others");
    div.innerHTML = `<strong>${msg.user}</strong><br>${msg.text}<br><small>${msg.time}</small>`;
    if (msg.user === currentUser) {
      div.onclick = () => {
        if (confirm("هل تريد حذف الرسالة؟")) {
          snapshot.ref.remove();
          div.remove();
        }
      };
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  });
}

// يكتب الآن...
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
    indicator.textContent = (typingUser && typingUser !== currentUser) ? `${typingUser} يكتب الآن...` : "";
  });
}

// دالة الرجوع لقائمة الغرف
function goBack() {
  document.getElementById("chatScreen").style.display = "none";
  document.getElementById("loginScreen").style.display = "flex";

  // إيقاف الاستماع
  database.ref(`${currentRoom}/messages`).off();
  database.ref(`${currentRoom}/typing`).off();

  // تفريغ بيانات الغرفة فقط
  currentRoom = "global";
  document.getElementById("roomInput").value = "";
  document.getElementById("chatBox").innerHTML = "";
  document.getElementById("typingIndicator").textContent = "";

  // إعادة الاسم من localStorage تلقائي
  const savedName = localStorage.getItem("chat_username");
  if (savedName) {
    currentUser = savedName;
    document.getElementById("usernameInput").value = savedName;
  }
}
