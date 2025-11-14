// server/routes/rtm.js
const express = require("express");
const router = express.Router();
const { RtmTokenBuilder, RtmRole } = require("agora-access-token");

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERT = process.env.AGORA_APP_CERT;

router.post("/generate", (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    if (!APP_ID || !APP_CERT) {
      return res.status(500).json({ error: "Missing Agora credentials" });
    }

    const expirationTimeInSeconds = 3600 * 5; // 5 Hours
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Generate token
    const token = RtmTokenBuilder.buildToken(
      APP_ID,
      APP_CERT,
      uid,
      RtmRole.Rtm_User,
      privilegeExpiredTs
    );

    return res.json({
      uid,
      rtmToken: token,
      expiresAt: privilegeExpiredTs
    });

  } catch (error) {
    console.error("RTM token generation error:", error);
    res.status(500).json({ error: "RTM token generation failed" });
  }
});

module.exports = router;
