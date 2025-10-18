const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ---------------- SEND CODE ----------------
const sendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with password (fully registered)
    const existingUser = await User.findOne({ 
      email: normalizedEmail,
      password: { $exists: true, $ne: null } // User has completed registration
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Email already registered. Please sign in instead." 
      });
    }

    // Check if there's an unverified user (no password) - allow them to continue verification
    let user = await User.findOne({ email: normalizedEmail });
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (!user) {
      // Create new unverified user
      user = new User({ 
        email: normalizedEmail, 
        verificationCode: code, 
        isVerified: false 
      });
    } else {
      // Update existing unverified user with new code
      user.verificationCode = code;
      user.isVerified = false;
    }
    
    await user.save();

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"AnonymousUrs" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED;">AnonymousUrs Verification Code</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #7C3AED; font-size: 32px; letter-spacing: 5px; text-align: center; margin: 20px 0;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`Verification code sent to: ${email}`);
    res.status(200).json({ 
      success: true,
      message: "Verification code sent successfully." 
    });
    
  } catch (error) {
    console.error("SendCode Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send verification code." 
    });
  }
};

// ---------------- VERIFY CODE ----------------
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        success: false,
        message: "Email and code are required." 
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found. Please request a new verification code." 
      });
    }
    
    if (!user.verificationCode) {
      return res.status(400).json({ 
        success: false,
        message: "No verification code found. Please request a new one." 
      });
    }

    if (user.verificationCode !== code.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid verification code. Please check and try again." 
      });
    }

    // Code is valid - verify user
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    console.log(`User verified successfully: ${email}`);
    
    res.status(200).json({ 
      success: true,
      message: "Email verified successfully." 
    });
    
  } catch (error) {
    console.error("VerifyCode Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during verification." 
    });
  }
};


// ---------------- REGISTER USER ----------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required." 
      });
    }

    // Check if user already exists with password (fully registered)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim(),
      password: { $exists: true, $ne: null }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Email already registered. Please sign in instead." 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Please verify your email first." 
      });
    }
    
    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Email not verified yet." 
      });
    }
    
    if (user.password) {
      return res.status(409).json({ 
        success: false,
        message: "Account already exists. Please sign in." 
      });
    }

    // Check if password meets requirements
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    // Hash password and complete registration
    const hashedPassword = await bcrypt.hash(password, 12);
    user.name = name.trim();
    user.password = hashedPassword;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log(`User registered successfully: ${email}`);
    
    res.status(201).json({ 
      success: true,
      message: "User registered successfully.",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      }
    });
    
  } catch (error) {
    console.error("RegisterUser Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration." 
    });
  }
};

// ---------------- AUTH USER (LOGIN) ----------------
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password required." 
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }
    
    if (!user.password) {
      return res.status(400).json({ 
        success: false,
        message: "Please complete your registration first." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials." 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      },
    });
    
  } catch (error) {
    console.error("AuthUser Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login." 
    });
  }
};

// ---------------- CHECK EMAIL AVAILABILITY ----------------
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required." 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with password (fully registered)
    const existingUser = await User.findOne({ 
      email: normalizedEmail,
      password: { $exists: true, $ne: null }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Email already registered." 
      });
    }

    // Email is available (either doesn't exist or exists but not fully registered)
    res.status(200).json({ 
      success: true,
      message: "Email is available." 
    });
    
  } catch (error) {
    console.error("CheckEmail Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during email check." 
    });
  }
};
module.exports = {
  sendCode,
  verifyCode,
  registerUser,
  authUser,
  checkEmail
};