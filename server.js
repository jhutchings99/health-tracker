// PULL IN EXPRESS
const express = require("express");

// INITIALIZE EXPRESS
const app = express();

// TELL EXPRESS TO USE JSON
app.use(express.json());

// SERVER UI TO BACKEND
app.use(express.static(`${__dirname}/public`));

// PULL IN USER MODEL
const { User } = require("./persist/model");

// PULL IN AUTHENTICATION AND AUTHORIZATION
const setUpAuth = require("./auth");
const setUpSession = require("./session");

// SET UP AUTHENTICATION AND AUTHORIZATION
setUpSession(app);
setUpAuth(app);

// CREATE USER ENDPOINT
app.post("/user", async (req, res) => {
    try {
        let user = await User.create ({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            age: req.body.age,
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: "Failed to create user",
            error: err
        });
    }
});

// GET USER BY ID
app.get("/user/:user_id", async (req, res) => {
    let user;

    // PULL USER FROM DB
    try {
        user = await User.findById(req.params.user_id);
    } catch (err) {
        res.status(500).json({
            message: `error finding user`,
            error: err,
        });
        return;
    }

    // RETURN USER
    res.status(200).json(user);
});

// POST WEIGHT TO USER BY ID
app.post("/user/:user_id/weight", async (req, res) => {
    let user;

    // PULL USER FROM DB
    try {
        user = await User.findById(req.params.user_id);
    } catch (err) {
        res.status(500).json({
            message: `error finding user`,
            error: err,
        });
        return;
    }

    // ADD WEIGHT TO USER
    try {
        await User.findByIdAndUpdate(req.params.user_id, {
            $push: {
                weights: {
                    date: req.body.date,
                    weight: req.body.weight,
                }
            }
        }, {
            new: true,
        });
    } catch (err) {
        res.status(500).json({
            message: `error adding weight to user`,
            error: err,
        });
        return;
    }

    // RETURN USER
    res.status(200).json(user);
}),

// EXPORT EXPRESS APP
module.exports = app;