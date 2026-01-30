const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const http = require("http");
const initSocket = require("./socket");
const { generalLimiter } = require("./middlewares/rateLimit");

const app = express();
// const PORT = 3001
const connectDB = require("./config/db");

// Load environment variables


// Connect to database
connectDB();

app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const userRoutes = require('./modules/users/user.routes')
const authRoutes = require("./modules/auth/auth.routes")
const messagingRoutes = require("./modules/messaging/messaging.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const adminRoutes = require("./modules/admin/admin.routes");



app.use("/api/profile",userRoutes );
app.use("/api/auth", authRoutes );

app.use("/api/", messagingRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/admin", adminRoutes);
const server = http.createServer(app);
initSocket(server);

server.listen(3001, () => {
    console.log("Server is Running ...")
})