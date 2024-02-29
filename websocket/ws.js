const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const { logger } = require("../helpers/logger");
const { getDatabase } = require("../database/db");

const db = getDatabase();
const coll = {
	chats: db.collection('chats'),
	broadcasts: db.collection('broadcasts'),
}

const clients = {};
const wss = new WebSocketServer({ port: process.env.WSPORT });

wss.on("listening", () => {
	logger.success(`WS Server is listening on port ${process.env.WSPORT}...`);
});

wss.on("connection", function connection(ws, req) {
	const userId = uuidv4();
	logger.info(`${userId} connected\n`);

	clients[userId] = { ws: ws };

	ws.on("message", function message(data) {
		data = JSON.parse(data);

		logger.info("received:", data.type);

		if (data.type === "Connection-Request") {
			if (data.email) clients[userId]["email"] = data.email;
			else logger.error("Email doesn't exists");
		} else if (data.type === "message") {
			sendMessage(userId, data.to, data.message);
		} else if (data.type === "broadcast") {
			broadcastMessage(userId, data.message);
		} else if (data.type === "connectedUsers") {
			sendConnectedUsersList(ws);
		} else {
			logger.debug(data);
		}
	});

	ws.on("close", () => {
		logger.info(`${userId} disconnected`);
		delete clients[userId];
	});
});

wss.on("error", (err) => {
	logger.error(`WebSocket server error: ${err}`);
});

async function sendMessage(from, to, message) {
	let sender = clients[from];
	let receiver = clients[to];
	if (receiver.ws.readyState === 1) {
		receiver.ws.send(
			JSON.stringify({
				type: "message",
				data: { username: sender.email, message: message, time: Date.now() },
			})
		);
		logger.info(`Message from ${sender.email} to ${receiver.email} successfully sent`);

		let chatData = {
			from: sender.email,
			to: receiver.email,
			msg: message,
			ts: Date.now()
		}
		try {
			await coll.chats.insertOne(chatData);
			logger.info("Chat updated in DB");
		} catch (err) {
			logger.error(err.message);
		}
	}
}

async function broadcastMessage(userId, message) {
	let successfullBroadcasts = [];
	const senderEmail = clients[userId].email;
	for (let cid in clients) {
		if (cid !== userId) {
			let client = clients[cid];
			if (client.ws.readyState === 1) {
				client.ws.send(
					JSON.stringify({
						type: "message",
						data: { username: senderEmail, message: message, time: Date.now() },
					})
				);
				successfullBroadcasts.push(client.email);
			}
		}
	}
	logger.info("Message Broadcast successfull");
	let chatData = {
		from: senderEmail,
		to: successfullBroadcasts,
		msg: message,
		ts: Date.now()
	}
	try {
		await coll.broadcasts.insertOne(chatData);
		logger.info("Broadcast updated in DB");
	} catch (err) {
		logger.error(err.message);
	}
}

function sendConnectedUsersList(ws) {
	let temp = {};
	Object.keys(clients).forEach((cid) => {
		temp[cid] = clients[cid].email;
	});
	ws.send(JSON.stringify({ type: "totalUsers", data: temp }));
}
