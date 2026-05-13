const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const controller = require("./messaging.controller");

router.use(protect);

router.post("/conversations", controller.createConversation);
router.get("/:conversationId", controller.getMessages);
router.post("/:conversationId", controller.sendMessage);
router.get(
  "/conversations/my",
  controller.getMyConversations
);
module.exports = router;
