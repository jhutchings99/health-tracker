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
    workouts: { type: Array, required: false, default: [
    {title: "Preacher Curl", id: new mongoose.Types.ObjectId, reps: [], gif: "https://gymvisual.com/img/p/1/5/9/6/9/15969.gif"},
    {title: "Incline Curl", id: new mongoose.Types.ObjectId, reps: [], gif: "https://gymvisual.com/img/p/2/0/9/5/1/20951.gif"},
    {title: "Bench Press", id: new mongoose.Types.ObjectId, reps: [], gif: "https://gymvisual.com/img/p/2/3/9/6/8/23968.gif"},
    {title: "Leg Press", id: new mongoose.Types.ObjectId, reps: [], gif: "https://gymvisual.com/img/p/1/5/7/3/3/15733.gif"},
    {title: "Skullcrusher", id: new mongoose.Types.ObjectId, reps: [], gif: "https://gymvisual.com/img/p/1/5/1/7/7/15177.gif"}] },
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