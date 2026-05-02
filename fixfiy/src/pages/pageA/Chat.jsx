
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import API from "../../services/api";

// const Chat = () => {
//   const { conversationId: paramConversationId } = useParams();
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
  
//   // استخراج المعرفات من الرابط
//   const jobId = searchParams.get("jobId");
//   const workerId = searchParams.get("workerId");

//   // تعريف الـ States
//   const [conversationId, setConversationId] = useState(paramConversationId || null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [creatingConversation, setCreatingConversation] = useState(false);
//   const [error, setError] = useState("");

//   const endRef = useRef(null);

//   // دالة النزول لآخر رسالة
//   const scrollToBottom = () => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   /**
//    * 1. دالة جلب الرسائل
//    * تم تعريفها قبل الـ useEffect وتغليفها بـ useCallback لتجنب خطأ الترتيب
//    */
//   const fetchMessages = useCallback(async () => {
//     if (!conversationId) return;

//     setLoading(true);
//     setError("");

//     try {
//       const response = await API.get(`/messages/${conversationId}`);
//       setMessages(response.data?.data || []);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Unable to load messages.");
//     } finally {
//       setLoading(false);
//     }
//   }, [conversationId]);

//   /**
//    * 2. دالة إنشاء محادثة جديدة (بناءً على الـ jobId)
//    * ملاحظة: السيرفر يتوقع jobId لإنشاء المحادثة بين العميل والعامل[cite: 3, 5]
//    */
//   const createConversation = useCallback(async () => {
//     if (!jobId) return;

//     setCreatingConversation(true);
//     setError("");

//     try {
//       // إرسال طلب إنشاء محادثة للسيرفر[cite: 3]
//       const response = await API.post("/conversations", { jobId });
//       const newConversationId = response.data?.data?._id;
      
//       if (newConversationId) {
//         setConversationId(newConversationId);
//       } else {
//         setError("Unable to start conversation.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Unable to start conversation.");
//     } finally {
//       setCreatingConversation(false);
//     }
//   }, [jobId]);

//   /**
//    * 3. الـ useEffect لإدارة بداية التحميل
//    * الترتيب هنا الآن صحيح لأن الدوال معرفة بالأعلى
//    */
//   useEffect(() => {
//     if (conversationId) {
//       fetchMessages();
//     } else if (jobId) {
//       createConversation();
//     }
//   }, [conversationId, jobId, createConversation, fetchMessages]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   /**
//    * 4. دالة إرسال رسالة جديدة
//    */
//   const handleSend = async (event) => {
//     event.preventDefault();
//     if (!newMessage.trim() || !conversationId) return;

//     setError("");

//     try {
//       const response = await API.post(`/messages/${conversationId}`, {
//         content: newMessage.trim(),
//       });

//       const createdMessage = response.data?.data;
//       if (createdMessage) {
//         setMessages((prev) => [...prev, createdMessage]);
//         setNewMessage("");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Unable to send message.");
//     }
//   };

//   return (
//     <div className="container py-4" style={{ maxWidth: 960 }}>
//       <div className="card shadow-sm">
//         <div className="card-header bg-primary text-white">
//           <h3 className="mb-0 h5">Chat Support</h3>
//           <small className="opacity-75">
//             {conversationId ? `Chat ID: ${conversationId}` : "Initializing..."}
//           </small>
//         </div>

//         <div className="card-body" style={{ height: "500px", display: "flex", flexDirection: "column" }}>
//           {error && (
//             <div className="alert alert-danger py-2" role="alert">
//               {error}
//             </div>
//           )}

//           {loading ? (
//             <div className="text-center my-auto">
//               <div className="spinner-border text-primary" role="status" />
//             </div>
//           ) : (
//             <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
//               {messages.length === 0 ? (
//                 <div className="text-center text-muted my-5">
//                   {creatingConversation ? "Setting up your chat..." : "No messages yet. Say hi!"}
//                 </div>
//               ) : (
//                 messages.map((message) => {
//                   const currentUserId = localStorage.getItem("userId");
//                   const isMine = currentUserId && String(message.senderId) === currentUserId;
//                   return (
//                     <div
//                       key={message._id || Math.random()}
//                       className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}
//                     >
//                       <div
//                         className={`p-3 rounded-3 ${isMine ? "bg-primary text-white" : "bg-light border"}`}
//                         style={{ maxWidth: "75%" }}
//                       >
//                         <div>{message.content}</div>
//                         <div 
//                           className={`mt-1 style={{ fontSize: "10px" }} ${isMine ? "text-white-50" : "text-muted"}`}
//                         >
//                           {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//               <div ref={endRef} />
//             </div>
//           )}
//         </div>

//        <div className="card-footer bg-white border-top">
//   <form 
//     onSubmit={handleSend} 
//     className="d-flex gap-2"
//     onClick={() => {
//       if (!conversationId) {
//         console.error("لا يمكن الكتابة: لم يتم إنشاء محادثة بعد (Missing conversationId)");
//       }
//     }}
//   >
//     <input
//       type="text"
//       className="form-control"
//       placeholder={creatingConversation ? "Creating chat..." : "Write a message..."}
//       value={newMessage}
//       onChange={(e) => setNewMessage(e.target.value)}
//       // قمنا بتبسيط الشرط للتأكد من أنه لا يمنعكِ من الكتابة بالخطأ
//       disabled={creatingConversation} 
//       autoFocus
//     />
//     <button 
//       type="submit" 
//       className="btn btn-primary" 
//       disabled={!newMessage.trim() || !conversationId || creatingConversation}
//     >
//       {creatingConversation ? "..." : "Send"}
//     </button>
//   </form>
  
//   {/* رسالة مساعدة تظهر لكِ إذا كان الـ ID مفقوداً لتعرفي سبب العطل */}
//   {!conversationId && !creatingConversation && (
//     <small className="text-danger d-block mt-1">
//       Warning: No conversation active. Check your Job ID.
//     </small>
//   )}
// </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;



















import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Send, ChevronLeft, MoreVertical, User } from "lucide-react"; // مكتبة lucide-react
import API from "../../services/api";
import "./chat.css"; 

const Chat = () => {
  const { conversationId: paramConversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const jobId = searchParams.get("jobId");
  const workerName = location.state?.workerName || "Technician";

  const [conversationId, setConversationId] = useState(paramConversationId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [error, setError] = useState("");

  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const response = await API.get(`/messages/${conversationId}`);
      setMessages(response.data?.data || []);
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const createConversation = useCallback(async () => {
    if (!jobId) return;
    setCreatingConversation(true);
    try {
      const response = await API.post("/conversations", { jobId });
      const newId = response.data?.data?._id;
      if (newId) setConversationId(newId);
    } catch (err) {
      setError("Could not start conversation.");
    } finally {
      setCreatingConversation(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (conversationId) fetchMessages();
    else if (jobId) createConversation();
  }, [conversationId, jobId, createConversation, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const tempMessage = newMessage;
    setNewMessage(""); 

    try {
      const response = await API.post(`/messages/${conversationId}`, {
        content: tempMessage.trim(),
      });
      setMessages((prev) => [...prev, response.data.data]);
    } catch (err) {
      setError("Message not sent.");
    }
  };

  return (
    <div className="chat-page-wrapper">
      <div className="chat-container">
        {/* --- HEADER --- */}
        <header className="chat-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={24} />
            </button>
            <div className="user-info">
              <div className="user-avatar-mini">
                <User size={20} color="#64748b" />
              </div>
              <div>
                <h4 className="user-name">{workerName}</h4>
                <span className="user-status">Online</span>
              </div>
            </div>
          </div>
          <button className="icon-btn"><MoreVertical size={20} /></button>
        </header>

        {/* --- MESSAGES AREA --- */}
        <main className="messages-area">
          {loading && <div className="loader">Loading...</div>}
          
          {messages.map((msg) => {
            const isMine = String(msg.senderId) === localStorage.getItem("userId");
            return (
              <div key={msg._id} className={`message-row ${isMine ? "me" : "them"}`}>
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </main>

        {/* --- INPUT AREA --- */}
        <footer className="chat-footer">
          <form onSubmit={handleSend} className="input-wrapper">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={creatingConversation}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!newMessage.trim() || !conversationId}
            >
              <Send size={20} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default Chat;