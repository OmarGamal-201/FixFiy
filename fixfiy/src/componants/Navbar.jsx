import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  Search,
} from "lucide-react";

import API, {
  getMyNotifications,
  markNotificationRead,
} from "../services/api";

const Navbar = () => {

  const navigate =
    useNavigate();

  const searchRef =
    useRef();

  const notificationRef =
    useRef();

  const [currentUser,
    setCurrentUser] =
    useState(null);

  const [search,
    setSearch] =
    useState("");

  const [results,
    setResults] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  /* ================= FETCH USER ================= */

  useEffect(() => {

    fetchMe();

  }, []);

  const fetchMe =
    async () => {

      try {

        const res =
          await API.get(
            "/profile/me"
          );

        setCurrentUser(
          res.data.data
        );

      } catch (err) {

        console.log(err);
      }
    };

  /* ================= NOTIFICATIONS ================= */

  const fetchNotifications =
    async () => {

      try {

        const res =
          await getMyNotifications();

        setNotifications(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);
      }
    };

  useEffect(() => {

    fetchNotifications();

    const interval =
      setInterval(
        fetchNotifications,
        10000
      );

    return () =>
      clearInterval(interval);

  }, []);

  const handleNotificationClick =
    async (notificationId) => {

      try {

        await markNotificationRead(
          notificationId
        );

        setNotifications(
          notifications.map(
            (n) =>

              n._id ===
              notificationId

                ? {
                    ...n,
                    read: true,
                  }

                : n
          )
        );

      } catch (err) {

        console.log(err);
      }
    };

  /* ================= SEARCH ================= */

  useEffect(() => {

    const delay =
      setTimeout(() => {

        if (
          search.trim().length >= 2
        ) {

          handleSearch();

        } else {

          setResults([]);
        }

      }, 400);

    return () =>
      clearTimeout(delay);

  }, [search]);

  const handleSearch = async () => {

    try {

      setLoading(true);

      const res =
        await API.get(
          `/profile?search=${search}`
        );

      let technicians =
        (res.data.data || [])
          .filter(
            (u) =>
              u.role ===
              "technician"
          );

      const keyword =
        search
          .toLowerCase()
          .trim();

      technicians =
        technicians.sort(
          (a, b) => {

            const aName =
              a.name?.toLowerCase() || "";

            const bName =
              b.name?.toLowerCase() || "";

            const aStarts =
              aName.startsWith(keyword);

            const bStarts =
              bName.startsWith(keyword);

            if (
              aStarts &&
              !bStarts
            )
              return -1;

            if (
              !aStarts &&
              bStarts
            )
              return 1;

            const aIncludes =
              aName.includes(keyword);

            const bIncludes =
              bName.includes(keyword);

            if (
              aIncludes &&
              !bIncludes
            )
              return -1;

            if (
              !aIncludes &&
              bIncludes
            )
              return 1;

            return (
              aName.length -
              bName.length
            );
          }
        );

      setResults(
        technicians
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  /* ================= CLOSE DROPDOWNS ================= */

  useEffect(() => {

    const closeDropdowns =
      (e) => {

        if (
          searchRef.current &&
          !searchRef.current.contains(
            e.target
          )
        ) {

          setResults([]);
        }

        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            e.target
          )
        ) {

          setShowNotifications(
            false
          );
        }
      };

    document.addEventListener(
      "click",
      closeDropdowns
    );

    return () =>
      document.removeEventListener(
        "click",
        closeDropdowns
      );

  }, []);

  const profileImageUrl =
    currentUser?.profilePicture?.[0]
      ?.url;

  return (

    <div
      className="navbar-container"
      style={{
        width: "100%",
        background: "#fff",
        padding:
          "14px 24px",
        borderBottom:
          "1px solid #eee",
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        gap: "20px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexWrap: "wrap",
      }}
    >

      {/* SEARCH */}

      <div
        ref={searchRef}
        style={{
          position: "relative",
          flex: 1,
          minWidth: "240px",
          maxWidth: "420px",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            background:
              "#f5f5f7",
            borderRadius:
              "14px",
            padding:
              "0 14px",
            height: "48px",
            border:
              "1px solid transparent",
          }}
        >

          <Search
            size={18}
            color="#777"
          />

          <input
            type="text"
            placeholder="Search technicians..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              border: "none",
              outline: "none",
              background:
                "transparent",
              width: "100%",
              padding:
                "0 12px",
              fontSize:
                "15px",
            }}
          />

        </div>

        {results.length >
          0 && (

          <div
            style={{
              position:
                "absolute",
              top: "55px",
              left: 0,
              width: "100%",
              background:
                "#fff",
              borderRadius:
                "18px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
              overflow:
                "hidden",
              border:
                "1px solid #eee",
              zIndex: 999,
            }}
          >

            {results.map(
              (user) => {

                const image =
                  user
                    ?.profilePicture?.[0]
                    ?.url;

                return (

                  <div
                    key={
                      user._id
                    }
                    onClick={() => {

                      navigate(
                        `/worker/${user._id}`
                      );

                      setResults(
                        []
                      );

                      setSearch(
                        ""
                      );
                    }}
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "14px",
                      padding:
                        "14px",
                      cursor:
                        "pointer",
                      transition:
                        "0.2s",
                      borderBottom:
                        "1px solid #f2f2f2",
                    }}
                    onMouseEnter={(
                      e
                    ) =>
                      (e.currentTarget.style.background =
                        "#fafafa")
                    }
                    onMouseLeave={(
                      e
                    ) =>
                      (e.currentTarget.style.background =
                        "#fff")
                    }
                  >

                    {image ? (

                      <img
                        src={
                          image
                        }
                        alt=""
                        style={{
                          width:
                            "50px",
                          height:
                            "50px",
                          borderRadius:
                            "50%",
                          objectFit:
                            "cover",
                        }}
                      />

                    ) : (

                      <div
                        style={{
                          width:
                            "50px",
                          height:
                            "50px",
                          borderRadius:
                            "50%",
                          background:
                            "linear-gradient(135deg,#7c3aed,#9333ea)",
                          color:
                            "#fff",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontWeight:
                            "bold",
                          fontSize:
                            "18px",
                        }}
                      >
                        {user.name
                          ?.charAt(
                            0
                          )
                          .toUpperCase()}
                      </div>
                    )}

                    <div>

                      <h4
                        style={{
                          margin: 0,
                          fontSize:
                            "15px",
                          fontWeight:
                            "700",
                          color:
                            "#111827",
                        }}
                      >
                        {
                          user.name
                        }
                      </h4>

                      <p
                        style={{
                          margin:
                            "3px 0 0",
                          color:
                            "#6b7280",
                          fontSize:
                            "13px",
                        }}
                      >
                        {user
                          ?.specialty ||
                          "Technician"}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* RIGHT SIDE */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          marginLeft: "auto",
        }}
      >

        {/* NOTIFICATIONS */}

        <div
          ref={notificationRef}
          style={{
            position:
              "relative",
          }}
        >

          <button
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            style={{
              width: "42px",
              height: "42px",
              borderRadius:
                "50%",
              border: "none",
              background:
                "#f5f5f7",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              cursor: "pointer",
              position:
                "relative",
            }}
          >

            <Bell
              size={20}
            />

            {notifications.some(
              (n) => !n.read
            ) && (

              <span
                style={{
                  position:
                    "absolute",
                  top: "8px",
                  right: "8px",
                  width: "9px",
                  height: "9px",
                  borderRadius:
                    "50%",
                  background:
                    "#ef4444",
                }}
              />

            )}

          </button>

          {showNotifications && (

            <div
              style={{
                position:
                  "absolute",
                top: "52px",
                right: 0,
                width: "320px",
                background:
                  "#fff",
                borderRadius:
                  "18px",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.1)",
                border:
                  "1px solid #eee",
                overflow:
                  "hidden",
                zIndex: 999,
              }}
            >

              <div
                style={{
                  padding:
                    "14px 16px",
                  borderBottom:
                    "1px solid #f1f1f1",
                  fontWeight:
                    "700",
                  fontSize:
                    "15px",
                }}
              >

                Notifications

              </div>

              <div
                style={{
                  maxHeight:
                    "350px",
                  overflowY:
                    "auto",
                }}
              >

                {notifications.length ===
                0 ? (

                  <div
                    style={{
                      padding:
                        "20px",
                      textAlign:
                        "center",
                      color:
                        "#6b7280",
                    }}
                  >

                    No notifications

                  </div>

                ) : (

                  notifications.map(
                    (notif) => (

                      <div
                        key={
                          notif._id
                        }
                        onClick={() =>
                          handleNotificationClick(
                            notif._id
                          )
                        }
                        style={{
                          padding:
                            "14px 16px",
                          borderBottom:
                            "1px solid #f3f4f6",
                          background:
                            notif.read
                              ? "#fff"
                              : "#f8fafc",
                          cursor:
                            "pointer",
                        }}
                      >

                        <h4
                          style={{
                            margin:
                              "0 0 4px",
                            fontSize:
                              "14px",
                            fontWeight:
                              "700",
                            color:
                              "#111827",
                          }}
                        >

                          {
                            notif.title
                          }

                        </h4>

                        <p
                          style={{
                            margin: 0,
                            fontSize:
                              "13px",
                            color:
                              "#6b7280",
                          }}
                        >

                          {
                            notif.message
                          }

                        </p>

                      </div>
                    )
                  )
                )}

              </div>

            </div>
          )}

        </div>

        {/* PROFILE */}

        <Link
          to={
            currentUser?.role ===
            "technician"
              ? "/worker-profile"
              : "/client-profile"
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration:
              "none",
          }}
        >

          <span
            style={{
              color:
                "#111827",
              fontWeight:
                "700",
              fontSize:
                "15px",
            }}
          >
            {
              currentUser?.name
            }
          </span>

          {profileImageUrl ? (

            <img
              src={
                profileImageUrl
              }
              alt=""
              style={{
                width:
                  "48px",
                height:
                  "48px",
                borderRadius:
                  "50%",
                objectFit:
                  "cover",
                border:
                  "3px solid #7c3aed",
              }}
            />

          ) : (

            <div
              style={{
                width:
                  "48px",
                height:
                  "48px",
                borderRadius:
                  "50%",
                background:
                  "linear-gradient(135deg,#7c3aed,#9333ea)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color:
                  "#fff",
                fontWeight:
                  "bold",
                fontSize:
                  "18px",
              }}
            >
              {currentUser?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>
          )}

        </Link>

      </div>

      {/* RESPONSIVE */}

      <style>
        {`
          @media (max-width: 768px) {

            .navbar-container{
              padding: 12px 16px !important;
              gap: 14px !important;
            }

            .navbar-container span{
              display:none;
            }

          }

          @media (max-width: 500px) {

            .navbar-container{
              flex-direction: column;
              align-items: stretch !important;
            }

          }
        `}
      </style>

    </div>
  );
};

export default Navbar;