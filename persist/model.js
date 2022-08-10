// PULL IN MONGOOSE
const mongoose = require('mongoose');

// PULL IN BCRYPT
const bcrypt = require('bcrypt');

// USER SCHEMA
const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    age : { type: Number, required: true },
    admin: { type: Boolean, default: false },
    weights: { type: Array, required: false },
});

// ENCRYPT USER PASSWORD
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        next();
    }
    catch (err) {
        next(err);
    }
});

// MODEL USER SCHEMA
const User = mongoose.model("User", userSchema);

// EXPORT MODELS
module.exports = {
    User
}