const fs = require("fs");
require("dotenv").config();

const { logger } = require("../helpers/logger");
const { getDatabase } = require("../database/db");

const { sendMail } = require("../nodemailer/nm");
const { OtpToResetPassword } = require("../mails/mails");

const db = getDatabase();
const coll = {
	users: db.collection("users")
};

const getAllContacts = async (req, res) => {
	logger.api("_Get All Contacts_");

	try {
		let options = {
			projection: { _id: false, nm: true, mob: true, avatar: true },
		};
		let list = await coll.users.find({}, options).toArray();
		res.status(200).json({ message: "Contacts fetched", contacts: list });
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const getAllUsers = async (req, res) => {
	logger.api("_Get All Users Request_");

	try {
		const options = { projection: { _id: false, pwd: false } };
		const users = await coll.users.find({}, options).toArray();

		if (!users.length) {
			return res.status(404).json({ message: "No user found" });
		}

		res.status(200).json({ message: "All users fetched", data: users });
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const changePassword = async (req, res) => {
	logger.api("_Change Password Request_");

	const { eml, oldPwd, newPwd } = req.body;

	if (!eml || !oldPwd || !newPwd) {
		return res.status(400).json({ message: "Mandatory parameters missing" });
	}

	try {
		const user = await coll.users.countDocuments({ eml: eml, pwd: oldPwd });
		if (!user) {
			return res.status(404).json({ message: "Wrong credentials" });
		}

		const result = await coll.users.updateOne(
			{ eml: eml, pwd: oldPwd },
			{ $set: { pwd: newPwd } }
		);
		if (!result.modifiedCount)
			return res.status(401).json({ message: "Password not changed" });

		res.status(200).json({ message: "Password successfully changed" });
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const updateProfile = async (req, res) => {
	logger.api("_Update Profile Request");

	const { id } = req.query;
	if (!id) return res.status(400).json({ message: "User Id missing" });

	try {
		const data = req.body;

		let options = { projection: { _id: false, pwd: false } };
		const user = await coll.users.findOne({ eml: id }, options);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const result = await coll.users.updateOne({ eml: id }, { $set: data });
		if (!result.modifiedCount)
			return res.status(401).json({ message: "Something went wrong" });

		Object.assign(user, data);
		res.status(200).json({ message: "Profile successfully updated", data: user });
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const removeProfilePic = async (req, res) => {
	logger.api("_Delete Profile Pic Request_");

	try {
		let { eml, avatar } = req.body;
		await coll.users.updateOne({ eml: eml }, { $unset: { avatar: "" } });

		const isExists = fs.existsSync(`./uploads/${avatar}`);
		if (isExists) {
			fs.unlink("./uploads/" + avatar, (err) => {
				if (err) {
					return res.status(401).json({ message: "Something went wrong" });
				}
				res.status(200).json({ message: "Profile pic successfully removed" });
			});
		} else {
			res.status(200).json({ message: "Profile pic successfully removed" });
		}
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const updateProfilePic = async (req, res) => {
	logger.api("_Update Profile Pic Request_");

	const { id } = req.query;
	if (!id || !req.file.filename)
		return res.status(400).json({ message: "Mandatory params missing" });

	try {
		// Access the uploaded file through req.file
		const uploadedFile = req.file.filename;
		const result = await coll.users.updateOne(
			{ eml: id },
			{ $set: { avatar: uploadedFile } }
		);

		if (!result.modifiedCount)
			return res.status(401).json({ message: "Something went wrong" });

		// Send a response indicating success
		res.status(200).json({ message: "Profile pic successfully uploaded", data: uploadedFile });
	} catch (error) {
		console.error("Error handling file upload:", error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const deleteAccount = async (req, res) => {
	logger.api("_Delete User Request_");

	const eml = req.query.username;
	if (!eml) {
		return res.status(400).json({ message: "Mandatory parameters missing" });
	}

	let query = { eml: eml };
	const deleteResult = await coll.users.deleteOne(query);

	if (!deleteResult.deletedCount) {
		return res.status(404).json({ message: "Something went wrong" });
	}

	res.status(200).json({ message: "User successfully deleted", data: { eml } });
};

const sendMailTester = function (req, res) {
	logger.api("_SEND MAIL API REQUEST_");
	const data = req.body

	let mailObj = {
		subject: "Reset password",
		html: OtpToResetPassword({ otp: 123456, ...data })
	};

	sendMail(mailObj, function (err, data) {
		if (err) {
			logger.err("Error:" + err);
			res.status(400).json({ message: "Failure in email sent" });
		} else {
			logger.info("Email successfully sent");
			logger.info(data);
			res.status(200).json({ message: "Email successfully sent", data: data });
		}
	});
};

module.exports = {
	getAllContacts,
	getAllUsers,
	changePassword,
	updateProfile,
	removeProfilePic,
	updateProfilePic,
	deleteAccount,
	sendMailTester,
};
