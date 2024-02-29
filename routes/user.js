const express = require("express");
const app = express();
const multer = require("multer");

// Set up multer to handle file uploads and store files on disk
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Specify the directory where we want to store the uploaded files
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		// Use the original name of the file for storage
		let filenm = Date.now() + "_SJ_" + file.originalname;
		cb(null, filenm);
	},
});
const upload = multer({ storage: storage });

const {
	getAllContacts,
	getAllUsers,
	changePassword,
	updateProfile,
	removeProfilePic,
	updateProfilePic,
	deleteAccount,
	sendMailTester,
} = require("../controllers/user");

// Get contact list endpoints
app.get("/allContacts", getAllContacts);

// Get all users endpoint
app.get("/all", getAllUsers);

// User password change endpoint
app.post("/changePassword", changePassword);

// Update user profile endpoint
app.post("/updateProfile", updateProfile);

// Delete user profile endpoint
app.post("/removeProfilePic", removeProfilePic);

// Update user profile pic endpoint
app.post("/updateProfilePic", upload.single("image"), updateProfilePic);

// Delete user endpoint
app.get("/delete", deleteAccount);

// Endpoints to send mails - testing
app.post("/sendMail", sendMailTester);

module.exports = app;
