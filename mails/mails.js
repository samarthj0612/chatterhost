let IMG_LAB_HOST = "";
IMG_LAB_HOST = "http://192.168.29.127:6066";
// IMG_LAB_HOST = "http://10.10.10.25:6066";

const getEmailTemplate = (args) => {
	let data =
		"<!DOCTYPE html>" +
		'<html lang="en">' +
		"	<head>" +
		'		<meta charset="UTF-8" />' +
		'		<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
		"		<title>Mail</title>" +
		"		<style>" +
		"			* { font-size: 14px; font-family: Arial, Helvetica, sans-serif; color: #333; }" +
		"      body{ max-width: 640px; box-shadow: inset 0px -8px 10px 1px #1111117a; background-color: #e6eff7; }" +
		"      #main{ padding: 16px; }" +
		"      #footer{ border-top: 1px solid #19191940; padding: 14px; text-align: center; }" +
		"      .social-icons{ margin-bottom: 5px; }" +
		"      .social-icons a{ margin: 0px 2px; }" +
		"		</style>" +
		"	</head>" +
		"	<body>" +
		'		<div id="main">' +
		'      <Header style="text-align: center;">' +
		'        <a href="#" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/chatterbox-0612.appspot.com/o/chatterbox-logo.png?alt=media&token=faf0d1d9-c45e-4f90-b14a-3310320aa744" width="60" height="60" alt="logo" /></a>' +
		"        <h1>" + (args.headerText || 'Chatterbox') + "</h1>" +
		"      </Header><br>" +
		"			<p>Dear " +
		(args.user || "user") +
		",</p>" +
		"     <div>" +
		args.content +
		"</div>" +
		"			<p>Team SJ</p>";

	if (args.regards) {
		data += "<div>" + args.regards + "</div>";
	} else {
		data +=
			'<p style="color: rgb(64, 0, 104)"> Regards<br />Samarth Jain<br /><a href="mailto:chatterbox.io.official@gmail.com" >chatter.io.official@gmail.com</a > </p><br>';
	}
	data +=
		'      <div id="footer">' +
		'        <div class="social-icons" >' +
		'          <a href="https://www.instagram.com/jain_spunky_sam/" target="_blank"> <img src="https://firebasestorage.googleapis.com/v0/b/chatterbox-0612.appspot.com/o/instagram.png?alt=media&token=95041bc7-a118-454b-8921-ca98b124fb37" width="19" height="19" alt="Instagram" /></a>' +
		'          <a href="https://in.linkedin.com/in/samarthjain02" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/chatterbox-0612.appspot.com/o/linkedin.png?alt=media&token=cd0ffd24-bbaf-428a-ae42-31d581257f36" width="19" height="19" alt="LinkedIn" /></a>' +
		'          <a href="https://www.facebook.com/profile.php?id=100054823608082" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/chatterbox-0612.appspot.com/o/facebook.png?alt=media&token=d6619bcd-c0a3-40d7-917d-14518f2a4d78" width="19" height="19" alt="Facebook" /></a>' +
		'          <a href="https://github.com/samarthj0612" target="_blank" ><img src="https://firebasestorage.googleapis.com/v0/b/chatterbox-0612.appspot.com/o/github.png?alt=media&token=5ac1c92e-bdee-48a3-8a9e-520cd7a2a3bb" width="19" height="19" alt="YouTube" /></a>' +
		"        </div>" +
		'        <span style="font-size: 12px; opacity: 0.6;">© 2023, All rights reserved by Samarth Jain.<br>Made with ♥️ Love</span>' +
		"      </div>" +
		"		</div>" +
		"	</body>" +
		"</html>";

	return data;
};

const getEmailRegards = (content, greet, user, contact, eml) => {
	let html = "";

	if (content) html += `<div>${content}</div>`;
	html += `<p style="color: rgb(64, 0, 104);">${greet ? greet : "Regards"}<br>${
		user ? user : "Samarth Jain"
	}<br>`;
	if (contact) html += `Contact: ${contact}`;
	if (eml) html += `<a href="mailto:${eml}">${eml}</a>`;
	html += "</p>";

	return html;
};

const OnSignup = (args) => {
  args.headerText = 'Welcome to Chatterbox'
	args.content =
    "<p>Congratulations! We're so happy to have you on board.</p>" +
		'Thank you for joining the Chatterbox<br>' +
		'Chatterbox is the communication app for teams who want to create calmer, more organized, more productive workplace</p>' +
    "<p>We founded chatterbox because we wanted to create a trustworthy and inspiring place for you to find everything you need to communicate and live well.</p>" +
		"<p>We are very excited to inform you that you are now the part of our family</p>";

  args.regards = getEmailRegards();

	return getEmailTemplate(args);
};

const OtpToResetPassword = (args) => {
	args.content =
    "<p>There was a request to reset your password!<br>" +
		'Use the verification code given below to reset your password -</p>' +
		'<h1 style="font-size: 28px;">' + args.otp + '</h1>' +
    "<p>This verification code is applicable for 2 hours.<br><br>If you did not make this request then please ignore this email.</p>";

  args.regards = getEmailRegards();

	return getEmailTemplate(args);
};

module.exports = { OnSignup, OtpToResetPassword };
