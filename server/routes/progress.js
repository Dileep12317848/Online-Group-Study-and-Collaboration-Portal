const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Message = require("../models/Message");
const Resource = require("../models/Resource");
const Group = require("../models/Group");

router.get("/summary", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const messagesSent = await Message.countDocuments({ sender: userId });
    const resourcesShared = await Resource.countDocuments({ uploadedBy: userId });
    const groupsJoined = await Group.countDocuments({ members: userId });

    res.json({
      messagesSent,
      resourcesShared,
      groupsJoined,
      lastActive: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: "Progress fetch failed" });
  }
});

module.exports = router;
