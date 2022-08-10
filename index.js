// PULL IN EXPRESS APP
const app = require("./server");

// PULL IN CONFIG
const config = require("./config");

// PULL IN MONGODB CONNECT FUNCTIONS
const { onConnect, connect } = require("./persist/connect");

onConnect (() => {
    var server = app.listen(config.port, () => {
        console.log(`Server listening on port ${config.port}`);
        console.log(`http://localhost:${config.port}`);
    });
});

connect(config.dbusername, config.dbpassword);