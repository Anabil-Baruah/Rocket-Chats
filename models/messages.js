const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({

    "conversation_id": mongoose.ObjectId,
    "sender": {
        "user_id": mongoose.ObjectId,
        "username": String
    },
    "content": String,
    "createdAt": {
        type: String,
        default: Date.now
    },
    "isSeen": {
        type: Boolean,
        default: false
    },
    file: String,
    fileType: String,
    filePublicId: String,
    // "metadata": {
    //     "attachments": [{
    //         "type": String,
    //         "url": String,
    //         "filename": String
    //     }],
    //     "reactions": [{
    //         "user_id": ObjectId,
    //         "reaction": String,
    //         "timestamp": Date
    //     }],
    //     "mentions": [ObjectId],
    //     "read_by": [ObjectId]
    // }
})

module.exports = mongoose.model('message', messageSchema)