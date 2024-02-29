const express = require("express");
const app = express();

const {
	sessionCheck,
	login,
	signup,
	logout,
	resetPassword,
	verifyOtp,
	changePasswordUsingOtp,
} = require("../controllers/index");

// Root endpoint | Isloggedin
app.get("/", sessionCheck);

// Login endpoint
app.post("/login", login);

// Signup endpoint
app.post("/signup", signup);

// Logout endpoint
app.get("/logout", logout);

// Get request to reset password
app.get("/resetPassword", resetPassword);

// Post request to verify otp
app.post("/verifyOtp", verifyOtp);

// Change password using otp endpoint
app.post("/changePasswordUsingOtp", changePasswordUsingOtp);

module.exports = app;
