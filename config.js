// PULL IN DOTENV
const dotenv = require("dotenv").config();

// USE PORT 3000 IF PORT NOT FOUND IN ENV
const port = process.env.PORT || 3000;

// EXPORT PORT, DBUSERNAME, DBPASSWORD, DBAUTH
module.exports = {
    port,
    dbusername: process.env.DBUSERNAME,
    dbpassword: process.env.DBPASSWORD,
    authsecret: process.env.AUTHSECRET,
}