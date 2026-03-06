const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");

const connectDB = require("./config/db");
const initSocket = require("./socket");
const { generalLimiter } = require("./middlewares/rateLimit");
const { protect } = require("./middlewares/auth.middleware");
const { authorize } = require("./middlewares/role.middleware");

const app = express();

/* ========================
   BASIC MIDDLEWARES
======================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

/* ========================
   DATABASE
======================== */
connectDB();

/* ========================
   ROUTES IMPORT
======================== */
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const serviceRoutes = require("./modules/services/service.routes");
const jobRoutes = require("./modules/jobs/job.routes");
const paymentRoutes = require("./modules/payments/payment.routes");
const walletRoutes = require("./modules/payments/wallet.routes");
const withdrawRoutes = require("./modules/payments/withdraw.routes");
const reviewRoutes = require("./modules/reviews/review.routes");
const messagingRoutes = require("./modules/messaging/messaging.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const adminRoutes = require("./modules/admin/admin.routes");

/* ========================
   PUBLIC ROUTES (NO TOKEN)
======================== */
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reviews", reviewRoutes);

/* ========================
   PROTECTED ROUTES
======================== */
app.use("/api/profile", protect, userRoutes);
app.use("/api/jobs", protect, jobRoutes);
app.use("/api/payments", protect, paymentRoutes);
app.use("/api/wallet", protect, walletRoutes);
app.use("/api/withdraw", protect, withdrawRoutes);
app.use("/api/messages", protect, messagingRoutes);
app.use("/api/notifications", protect, notificationRoutes);

/* ========================
   ADMIN ROUTES
======================== */
app.use(
  "/api/admin",
  protect,
  authorize("admin"),
  adminRoutes
);

/* ========================
   SERVER + SOCKET
======================== */
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
