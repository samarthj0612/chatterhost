const nodemailer = require("nodemailer");
const { logger } = require("../helpers/logger");
require("dotenv").config();

let transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		type: "OAuth2",
		user: process.env.MAIL_AUTH_EMAIL,
		pass: process.env.MAIL_AUTH_WORD,
		clientId: process.env.MAIL_OAUTH_CLIENTID,
		clientSecret: process.env.MAIL_OAUTH_CLIENT_SECRET,
		refreshToken: process.env.MAIL_OAUTH_REFRESH_TOKEN,
	},
});

transporter.verify((err, success) => {
	if (err) logger.error(err);
	else logger.success("Nodemailer is now ready to send mails...");
});

const sendMail = (mailOptions, cb) => {
	if (!mailOptions.from) mailOptions.from = process.env.MAIL_DEFAULT_FROM;
	if (!mailOptions.to) mailOptions.to = process.env.MAIL_DEFAULT_TO;

	transporter.sendMail(mailOptions, function (err, data) {
		if (err) {
			return cb(err);
		} else {
			return cb(null, data);
		}
	});
};

module.exports = { sendMail };
