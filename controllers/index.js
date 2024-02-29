const jwt = require('jsonwebtoken');
require("dotenv").config();

const { logger } = require("../helpers/logger");
const { getDatabase } = require("../database/db");

const { sendMail } = require("../nodemailer/nm");
const { OnSignup, OtpToResetPassword } = require("../mails/mails");

const db = getDatabase();
const coll = {
	users: db.collection('users'),
	tokens: db.collection("tokens"),
}

const sessionCheck = async (req, res) => {
	logger.api("_Session Check_");

	const token = req.headers.authorization;
	if (token === "null") {
		return res.status(401).json({ message: "Unauthorized access" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		if (!decoded) {
			return res.status(401).json({ message: "Access Denied" });
		}

		let options = { projection: { _id: false, pwd: false } };
		const user = await coll.users.findOne({ eml: decoded.username }, options);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		logger.info("Session Restored");
		res.status(200).json({ message: "User successfully loggedIn", data: user });
	} catch (error) {
		logger.error(error.message);
		res.status(401).json({ message: "Something went wrong", error: error });
	}
};

const login = async (req, res) => {
	logger.api("_Login Request_");

	let data = req.body;
	if (!data || !data.eml || !data.pwd) {
		return res.status(404).json({ message: "Mandatory parameters missing" });
	}

	try {
		let query = { eml: data.eml, pwd: data.pwd };
		let options = { projection: { _id: false, pwd: false } };
		let user = await coll.users.findOne(query, options);

		if (!user) {
			return res.status(404).json({ message: "Wrong credentials" });
		}

		const token = jwt.sign({ username: user.eml }, process.env.JWT_SECRET_KEY, { expiresIn: "1d", });
		res.status(200).json({ message: "User successfully logged in", data: { user: user, token: token }, });
	} catch (error) {
		logger.error(error);
		res.status(401).json({ message: "Something went wrong", error: error });
	}
};

const signup = async (req, res) => {
	logger.api("_Signup Request_");

	let data = req.body;
	if (!data || !data.nm || !data.eml || !data.mob || !data.pwd) {
		return res.status(400).json({ message: "Mandatory parameters missing" });
	}

	const query = { eml: data.eml };
	const isUserExists = await coll.users.countDocuments(query);

	if (isUserExists) {
		return res.status(409).json({ message: "User already registered" });
	}

	let userData = {
		nm: data.nm,
		eml: data.eml,
		mob: data.mob,
		pwd: data.pwd,
	};

	try {
		await coll.users.insertOne(userData);
		delete data.pwd;

		let mailObj = {
			to: userData.eml,
			subject: "Welcome to Chatterbox",
			html: OnSignup({ user: userData.nm }),
		};

		sendMail(mailObj, function (err, data) {
			if (err) {
				logger.err("Error while sending email:" + err);
			} else {
				logger.info("Email successfully sent");
			}
			return res.status(200).json({ message: "User successfully registered", data: data });
		});
		return res.status(200).json({ message: "User successfully registered", data: data });
	} catch (error) {
		return res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const logout = async (req, res) => {
	logger.api("_Logout Request_");
	res.status(200).json({ message: "User successfully logged out" });
};


const resetPassword = async (req, res) => {
	logger.api("_Reset Password_");

	const { id } = req.query;
	if (!id) return res.status(400).json({ message: "User Id missing" });

	try {
		const user = await coll.users.find({ eml: id }, { projection: { _id: 0, nm: 1 } });
		if (!user) {
			return res.status(404).json({ message: "Email Id not found" });
		}

		const otp = Math.floor(Math.random() * 1000000);
		const createdAt = Date.now();
		const data = { eml: id, otp: otp, type: 1, createdAt: createdAt, expiredAt: createdAt + 600000, }
		const result = await coll.tokens.insertOne(data);

		if (!result.acknowledged) {
			return res.status(404).json({ message: "Something went wrong" });
		}

		let mailObj = {
			to: id,
			subject: "Reset password",
			html: OtpToResetPassword({ otp: otp, user: user.nm })
		};

		sendMail(mailObj, (err, data) => {
			if (err) {
				return res.status(404).json({ message: "Verification code failed to send" });
			}
			res.status(200).json({ message: "Verification code successfully sent", eml: id });
		});
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

const verifyOtp = async (req, res) => {
	logger.api("_Verify OTP_");

	const { eml, otp } = req.body;
	if (!eml || !otp) {
		return res.status(400).json({ message: "Mandatory params missing" });
	}

	try {
		const otpDoc = await coll.tokens.findOne({ eml: eml, otp: Number(otp) });
		if (!otpDoc) {
			return res.status(404).json({ message: "Verification failed" });
		}

		if (Date.now() > otpDoc.expiredAt)
			return res.status(404).json({ message: "Verification code expired" });

		res.status(200).json({ message: "OTP Successfully Verified" });
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};


const changePasswordUsingOtp = async (req, res) => {
	logger.api("_Change Password Using OTP Request_");

	const { eml, otp, newPwd } = req.body;

	if (!eml || !otp || !newPwd) {
		return res.status(400).json({ message: "Mandatory parameters missing" });
	}

	try {
		const isVerified = await coll.tokens.countDocuments({
			eml: eml,
			otp: Number(otp),
		});
		if (!isVerified) {
			return res.status(404).json({ message: "Verification failed" });
		}

		const result = await coll.users.updateOne(
			{ eml: eml },
			{ $set: { pwd: newPwd } }
		);
		if (!result.modifiedCount)
			return res.status(401).json({ message: "Password not changed" });

		let options = { projection: { _id: false, pwd: false } };
		const user = await coll.users.findOne({ eml: eml }, options);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const token = jwt.sign({ username: user.eml }, process.env.JWT_SECRET_KEY, { expiresIn: "1d", });
		res.status(200).json({ message: "Password successfully changed", user: user, token: token, });
	} catch (error) {
		logger.error(error.message);
		res.status(500).json({ message: "Something went wrong", error: error });
	}
};

module.exports = { sessionCheck, login, signup, logout, resetPassword, verifyOtp, changePasswordUsingOtp };
