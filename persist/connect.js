// PULL IN MONGOOSE
const mongoose = require("mongoose");

// INITIALIZE MONGOOSE
const db = mongoose.connection;

// CONNECT TO MONGODB
async function connect (dbusername, dbpassword) {
    let connectionString = `mongodb+srv://${dbusername}:${dbpassword}@cluster0.lxxgjeu.mongodb.net/?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log(`Error connecting to MongoDb: ${err}`);
    }
}

// ON CONNECT TO MONGODB
function onConnect(callback) {
    db.once("open", () => {
        console.log("Successfully connected to MongoDb");
        callback();
    });
}

// EXPORT CONNECT AND ONCONNECT FUNCTIONS
module.exports = {
    connect,
    onConnect,
}