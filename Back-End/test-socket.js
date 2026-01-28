const { io } = require("socket.io-client");
console.log("🚀 test-socket file started");

// 🔑 حطي توكن حقيقي (Client أو Technician)
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzk5YTc3M2Y5ZTBmMWJhZDEyYWIzMyIsImlhdCI6MTc2OTU4Nzg0OSwiZXhwIjoxNzcwMTkyNjQ5fQ.FeHXddUlMdQ0YdWB3pXZi2krPP3p7tdQAmOy27FNA38"
const socket = io("http://localhost:3001", {
  auth: {
    token: TOKEN,
  },
});
socket.on("connect_error", (err) => {
  console.error("❌ connect_error:", err.message);
});

socket.on("connect", () => {
  console.log("✅ socket connected:", socket.id);
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);

  // 👇 حطي conversationId حقيقي
  socket.emit("joinConversation", {
    conversationId: "6979cc5d0ad9276335b95035",
  });

  // ابعتي رسالة
  socket.emit("sendMessage", {
    conversationId: "6979cc5d0ad9276335b95035",
    content: "Hello from socket test 👋",
  });
});

socket.on("newMessage", (message) => {
  console.log("📩 New Message:", message);
});

socket.on("errorMessage", (err) => {
  console.error("❌ Error:", err);
});

socket.on("disconnect", () => {
  console.log("🔌 Socket disconnected");
});
