const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const controller = require("./messaging.controller");

router.use(protect);

router.post("/conversations", controller.createConversation);
router.get("/:conversationId", controller.getMessages);

module.exports = router;
