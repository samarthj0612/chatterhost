const express = require("express");
const app = express();
const cors = require("cors");

const { logger } = require("./helpers/logger");
const { connectToDatabase } = require("./database/db");

connectToDatabase(onSuccess, onFailure);

function onSuccess() {
	const indexRouter = require("./routes/index");
	const userRouter = require("./routes/user");
	require("dotenv").config();

	// we don't need to add a separate body-parser middleware because it's included by default in Express now.
	app.use(express.json());

	const corsOptions = {
		// origin: `http://localhost:{process.env.RNPORT}`, // Set this to your frontend's domain
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true, // Include cookies or authorization headers
		optionsSuccessStatus: 204, // Set the response for preflight requests
	};

	app.use(cors(corsOptions));

	app.use("/auth", indexRouter);
	app.use("/user", userRouter);

	app.listen(process.env.PORT, () => {
		logger.success(`Node Server is running at port ${process.env.PORT}...`);
		require("./websocket/ws");
	});
}

function onFailure() {
	logger.error("DB Connection: Failed to connect mongodb atlas");
}
