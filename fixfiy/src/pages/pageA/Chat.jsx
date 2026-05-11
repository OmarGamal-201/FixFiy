import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Send,
  ChevronLeft,
  User,
} from "lucide-react";

import { io } from "socket.io-client";

import API from "../../services/api";

import "./chat.css";

const Chat = () => {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const searchParams =
    new URLSearchParams(
      location.search
    );

  const jobId =
    searchParams.get(
      "jobId"
    );

  // IMPORTANT FIX

  const currentUserId =
    String(
      localStorage.getItem(
        "userId"
      )
    );

  const displayName =
    location.state
      ?.workerName ||
    location.state
      ?.clientName ||
    "Chat";

  const [
    conversationId,
    setConversationId,
  ] = useState(null);

  const [messages,
    setMessages] =
    useState([]);

  const [newMessage,
    setNewMessage] =
    useState("");

  const [loading,
    setLoading] =
    useState(true);

  const socketRef =
    useRef(null);

  const endRef =
    useRef(null);

  // ================= SOCKET =================

  useEffect(() => {

    socketRef.current =
      io(
        "http://localhost:3000",
        {
          auth: {
            token:
              localStorage.getItem(
                "token"
              ),
          },
        }
      );

    // RECEIVE REALTIME MESSAGE

    socketRef.current.on(
      "newMessage",
      (msg) => {

        setMessages(
          (prev) => {

            // PREVENT DUPLICATES

            const exists =
              prev.some(
                (m) =>
                  m._id ===
                  msg._id
              );

            if (exists)
              return prev;

            return [
              ...prev,
              msg,
            ];
          }
        );

        scrollToBottom();
      }
    );
console.log("CURRENT USER ID:", currentUserId);

messages.forEach((msg) => {

  const senderId =
    typeof msg.senderId === "object"
      ? msg.senderId?._id
      : msg.senderId;

  console.log({
    senderId: String(senderId),
    currentUserId: String(currentUserId),
    equal:
      String(senderId) ===
      String(currentUserId),
  });
});
    return () => {
      socketRef.current.disconnect();
    };

  }, []);

  // ================= SETUP CHAT =================

  const setupChat =
    useCallback(
      async () => {

        if (!jobId)
          return;

        try {

          setLoading(
            true
          );

          // CREATE / GET CONVERSATION

          const res =
            await API.post(
              "/messages/conversations",
              {
                jobId,
              }
            );

          const conv =
            res.data.data;

          setConversationId(
            conv._id
          );

          // GET MESSAGES

          const msgRes =
            await API.get(
              `/messages/${conv._id}`
            );

          setMessages(
            msgRes.data
              .data || []
          );

          // JOIN ROOM

          socketRef.current.emit(
            "joinConversation",
            {
              conversationId:
                conv._id,
            }
          );

          setTimeout(
            scrollToBottom,
            100
          );

        } catch (err) {

          console.log(
            err.response
              ?.data
          );

          alert(
            err.response
              ?.data
              ?.message ||
              "Failed to open chat"
          );

        } finally {

          setLoading(
            false
          );
        }
      },
      [jobId]
    );

  useEffect(() => {

    setupChat();

  }, [setupChat]);

  // ================= SCROLL =================

  const scrollToBottom =
    () => {

      endRef.current
        ?.scrollIntoView({
          behavior:
            "smooth",
        });
    };

  // ================= SEND =================

  const handleSend =
    async (e) => {

      e.preventDefault();

      if (
        !newMessage.trim() ||
        !conversationId
      )
        return;

      const content =
        newMessage.trim();

      setNewMessage("");

      try {

        const res =
          await API.post(
            `/messages/${conversationId}`,
            {
              content,
            }
          );

        const savedMessage =
          res.data.data;

        // ADD ONLY ONCE

        setMessages(
          (prev) => [
            ...prev,
            savedMessage,
          ]
        );

        // EMIT SOCKET

        socketRef.current.emit(
          "sendMessage",
          savedMessage
        );

        scrollToBottom();

      } catch (err) {

        alert(
          err.response
            ?.data
            ?.message ||
            "Failed to send message"
        );
      }
    };

  return (

    <div className="chat-container">

      {/* HEADER */}

      <header className="chat-header">

        <button
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >

          <ChevronLeft />

        </button>

        <div className="user-info">

          <div className="chat-avatar">

            <User size={20} />

          </div>

          <div>

            <h4>
              {displayName}
            </h4>

            <span>
              Active now
            </span>

          </div>

        </div>

      </header>

      {/* MESSAGES */}

      <main className="messages-area">

        {loading ? (

          <div className="chat-loading">

            Loading...

          </div>

        ) : messages.length ===
          0 ? (

          <div className="empty-chat">

            <h3>
              No messages yet
            </h3>

            <p>
              Start the conversation.
            </p>

          </div>

        ) : (

          messages.map(
            (
              msg,
              index
            ) => {

              // FIX SENDER ID

              const senderId =

                String(
                  typeof msg.senderId ===
                  "object"

                    ? msg.senderId?._id

                    : msg.senderId
                );

              // IMPORTANT

              const isMine =
                senderId ===
                currentUserId;

              return (

                <div
                  key={
                    msg._id ||
                    index
                  }
                  className={`message-row ${
                    isMine
                      ? "me"
                      : "them"
                  }`}
                >

                  <div
                    className={`message-bubble ${
                      isMine
                        ? "mine"
                        : "other"
                    }`}
                  >

                    <p>
                      {
                        msg.content
                      }
                    </p>

                    <span className="time">

                      {new Date(
                        msg.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "2-digit",

                          minute:
                            "2-digit",
                        }
                      )}

                    </span>

                  </div>

                </div>
              );
            }
          )
        )}

        <div ref={endRef} />

      </main>

      {/* FOOTER */}

      <footer className="chat-footer">

        <form
          onSubmit={
            handleSend
          }
        >

          <input
            value={
              newMessage
            }
            onChange={(
              e
            ) =>
              setNewMessage(
                e.target
                  .value
              )
            }
            placeholder="Type your message..."
          />

          <button
            type="submit"
            disabled={
              !newMessage.trim()
            }
          >

            <Send
              size={18}
            />

          </button>

        </form>

      </footer>

    </div>
  );
};

export default Chat;