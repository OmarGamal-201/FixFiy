

//33333

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Send, ChevronLeft, User } from "lucide-react";
import { io } from "socket.io-client"; // تأكدي من تثبيتها: npm install socket.io-client
import API from "../../services/api";
import "./chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get("jobId");
  
  // تحديد اسم الطرف الآخر للعرض في الهيدر
  const currentUserId = localStorage.getItem("userId");
  const displayName = location.state?.workerName || location.state?.clientName || "Chat";

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const endRef = useRef(null);

  // --- 1. إعداد السوكت عند فتح الصفحة ---
  useEffect(() => {
    // اربطي السوكت بعنوان الباك إند بتاعك
    socketRef.current = io("http://localhost:3000", {
      auth: { token: localStorage.getItem("token") }
    });

    // استقبال رسالة جديدة لحظياً
    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => socketRef.current.disconnect();
  }, []);

  // --- 2. إنشاء المحادثة أو جلبها والانضمام للغرفة ---
  const setupChat = useCallback(async () => {
    try {
      // نطلب من الباك إند إنشاء/جلب المحادثة بناءً على الـ jobId
      const res = await API.post("/conversations", { jobId });
      const conv = res.data.data;
      setConversationId(conv._id);

      // جلب الرسائل القديمة
      const msgRes = await API.get(`/messages/${conv._id}`);
      setMessages(msgRes.data.data);

      // الانضمام لغرفة السوكت (Real-time Room)
      socketRef.current.emit("joinConversation", { jobId });
      
    } catch (err) {
      console.error("Chat setup failed:", err.message);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) setupChat();
  }, [jobId, setupChat]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- 3. إرسال رسالة ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      // 1. حفظ في الداتابيز عبر الـ API
      await API.post(`/messages/${conversationId}`, { content });
      
      // 2. إرسال عبر السوكت عشان يوصل للطرف التاني فوراً
      socketRef.current.emit("sendMessage", { conversationId, content });
      
      // 3. إضافة رسالتي في قائمة الرسائل عندي
      setMessages(prev => [...prev, {
        senderId: currentUserId,
        content,
        createdAt: new Date()
      }]);
      scrollToBottom();

    } catch (err) {
      alert("Message failed to send");
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <button onClick={() => navigate(-1)}><ChevronLeft /></button>
        <div className="user-info">
          <User size={20} />
          <h4>{displayName}</h4>
        </div>
      </header>

      <main className="messages-area">
        {messages.map((msg, index) => {
          const isMine = String(msg.senderId) === currentUserId;
          return (
            <div key={index} className={`message-row ${isMine ? "me" : "them"}`}>
              <div className="message-bubble">
                <p>{msg.content}</p>
                <span className="time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </main>

      <footer className="chat-footer">
        <form onSubmit={handleSend}>
          <input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type your message..."
          />
          <button type="submit" disabled={!newMessage.trim()}>Send</button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;







