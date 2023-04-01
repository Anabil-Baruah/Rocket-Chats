const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    groupName: String,
    profilePhoto:String,
    description:String,
    members: [{
        _id: mongoose.ObjectId,
        username: String
    }],
    admin: {
        _id: mongoose.ObjectId,
        username: String
    }
})

module.exports = mongoose.model("groups", groupSchema)