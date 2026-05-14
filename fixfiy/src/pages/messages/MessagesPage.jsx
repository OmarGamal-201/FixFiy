import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  MessageCircle,
  User,
  ChevronRight,
} from "lucide-react";

import API from "../../services/api";

import "./MessagesPage.css";

function getOtherUser(
  participants,
  currentUserId
) {

  return participants.find(
    (p) =>
      String(p._id) !==
      String(currentUserId)
  );
}

export default function MessagesPage() {

  const navigate =
    useNavigate();

  const currentUserId =
    localStorage.getItem(
      "userId"
    );

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    fetchConversations();

  }, []);

  const fetchConversations =
    async () => {

      try {

        const res =
          await API.get(
            "/messages/conversations/my"
          );

        setConversations(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

 const openChat =
  (conversation) => {

    const otherUser =
      getOtherUser(
        conversation.participants,
        currentUserId
      );

    // JOB CHAT

    if (
      conversation.conversationType ===
      "JOB"
    ) {

      const otherUser =
  getOtherUser(
    conversation.participants,
    currentUserId
  );

navigate(
  `/chat?jobId=${conversation.jobId?._id}`,
  {
    state: {
      workerName:
        otherUser?.name,

      workerId:
        otherUser?._id,

      role:
        otherUser?.role,
    },
  }
);

      return;
    }

    // INQUIRY CHAT

   navigate(
  `/chat?workerId=${otherUser?._id}`,
  {
    state: {
      workerName:
        otherUser?.name,

      workerId:
        otherUser?._id,

      role:
        otherUser?.role,
    },
  }
);
  };

  return (

    <div className="messages-page">

      <div className="messages-header">

        <h1>
          Messages
        </h1>

        <p>
          Your conversations
        </p>

      </div>

      {loading ? (

        <div className="messages-loading">

          Loading conversations...

        </div>

      ) : conversations.length ===
        0 ? (

        <div className="empty-messages">

          <MessageCircle
            size={50}
          />

          <h3>
            No conversations yet
          </h3>

          <p>
            Start chatting with technicians.
          </p>

        </div>

      ) : (

        <div className="conversations-list">

          {conversations.map(
            (conversation) => {

              const otherUser =
                getOtherUser(
                  conversation.participants,
                  currentUserId
                );

              return (

                <div
                  key={
                    conversation._id
                  }
                  className="conversation-card"
                  onClick={() =>
                    openChat(
                      conversation
                    )
                  }
                >

                  <div className="conversation-avatar">

                    <User
                      size={22}
                    />

                  </div>

                  <div className="conversation-info">

                    <h3>

                      {otherUser?.name ||
                        "User"}

                    </h3>

                    <p>

                      {conversation.lastMessage ||
                        "No messages yet"}

                    </p>

                    <span>

                      {conversation.conversationType ===
                      "JOB"

                        ? "Job Chat"

                        : "Inquiry Chat"}

                    </span>

                  </div>

                  <ChevronRight
                    size={20}
                    className="conversation-arrow"
                  />

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}