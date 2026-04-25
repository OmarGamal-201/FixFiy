// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:3000/api"
// });

// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     req.headers.Authorization = `Bearer ${token}`;
//   }

//   return req;
// });

// export default API;


import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// TOKEN
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ======================
// NOTIFICATIONS
// ======================
export const getMyNotifications = () => {
  return API.get("/notifications");
};

export const markNotificationRead = (id) => {
  return API.patch(`/notifications/${id}/read`);
};

// ======================
// SEARCH
// ======================
export const adminSearch = (query) => {
  return API.get(`/admin/search?q=${query}`);
};

export default API;