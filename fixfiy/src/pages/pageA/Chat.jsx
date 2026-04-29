import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import API from "../../services/api";

const Chat = () => {
  const { conversationId: paramConversationId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get("jobId");
  const workerId = searchParams.get("workerId");

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

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    } else if (jobId) {
      createConversation();
    }
  }, [conversationId, jobId, createConversation, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createConversation = async () => {
    if (!jobId) return;

    setCreatingConversation(true);
    setError("");

    try {
      const response = await API.post("/conversations", { jobId });
      const newConversationId = response.data?.data?._id;
      if (newConversationId) {
        setConversationId(newConversationId);
      } else {
        setError("Unable to start conversation.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to start conversation.");
    } finally {
      setCreatingConversation(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    setLoading(true);
    setError("");

    try {
      const response = await API.get(`/messages/${conversationId}`);
      setMessages(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    setError("");

    try {
      const response = await API.post(`/messages/${conversationId}`, {
        content: newMessage.trim(),
      });

      const createdMessage = response.data?.data;
      if (createdMessage) {
        setMessages((prev) => [...prev, createdMessage]);
        setNewMessage("");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to send message.");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <div className="card shadow-sm">
        <div className="card-header">
          <h3 className="mb-0">Client / Technician Chat</h3>
          <p className="text-muted mb-0">
            {conversationId
              ? `Conversation ID: ${conversationId}`
              : jobId
              ? "Starting new chat for job..."
              : workerId
              ? `Contacting ${location.state?.workerName || "technician"}. Please open an existing job chat.`
              : "Provide a jobId query or use a conversation route."}
          </p>
        </div>

        <div className="card-body" style={{ minHeight: 420, display: "flex", flexDirection: "column" }}>
          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
              {messages.length === 0 ? (
                <div className="text-center text-muted py-5">
                  {conversationId
                    ? "No messages yet. Send the first message."
                    : creatingConversation
                    ? "Creating conversation..."
                    : "No chat selected."}
                </div>
              ) : (
                messages.map((message) => {
                  const currentUserId = localStorage.getItem("userId");
                  const isMine = currentUserId && String(message.senderId) === currentUserId;
                  return (
                    <div
                      key={message._id || `${message.createdAt}-${message.content}`}
                      className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div
                        className={`p-3 rounded ${isMine ? "bg-primary text-white" : "bg-light text-dark"}`}
                        style={{ maxWidth: "78%", wordBreak: "break-word" }}
                      >
                        <div>{message.content}</div>
                        <small className="text-muted d-block mt-2" style={{ fontSize: 12 }}>
                          {new Date(message.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="card-footer bg-white border-top">
          <form onSubmit={handleSend} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!conversationId || creatingConversation}
            />
            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim() || !conversationId || creatingConversation}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
