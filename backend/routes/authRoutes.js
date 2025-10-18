const express = require("express");
const router = express.Router();
const {
  sendCode,
  verifyCode,
  registerUser,
  authUser,
} = require("../controllers/authController");

// Step 1: Send email verification code
router.post("/send-code", sendCode);

// Step 2: Verify code
router.post("/verify-code", verifyCode);

// Step 3: Register after verification
router.post("/signup", registerUser);

// Step 4: Login
router.post("/login", authUser);

module.exports = router;
