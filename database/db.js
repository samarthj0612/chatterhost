const { MongoClient, ServerApiVersion } = require("mongodb");
const { logger } = require("../helpers/logger");
require("dotenv").config();

const databaseName = "chatterbox";
let db;

// MongoDB Atlas credentials and connection URL
// const username = process.env.ATLAS_USERNAME;
// const password = process.env.ATLAS_PWD;
// const clusterUrl = process.env.ATLAS_CLUSTER_URL;
// const dbUrl = `mongodb+srv://${username}:${password}@${clusterUrl}/${databaseName}?retryWrites=true&w=majority`;

// Local MongoDB Connection
const dbUrl = "mongodb://localhost:27017/chatterbox";

// Connect to the MongoDB Atlas cluster
const client = new MongoClient(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function connectToDatabase(onSuccess, onFailure) {
	try {
		await client.connect();
		logger.success("MongoDB Atlas Connection Established");
		db = client.db(databaseName);
		onSuccess();
	} catch (err) {
		logger.error("Error while connecting to MongoDB:", err.message);
		logger.error("Database connection has not been established.")
		onFailure();
	}
}

function getDatabase() {
	if (!db) {
		throw new Error("Error while fetching database");
	}
	return db;
}

// Export the function to use in your application
module.exports = {
	connectToDatabase,
	getDatabase,
};
