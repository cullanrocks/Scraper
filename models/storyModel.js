const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let storySchema = new Schema({
    headline: {
        type: String,
        index: {
            unique: true
        },
        required: true
    },
    link: {
        type: String,
        required: true
    },
    data_id: {
        type: Number,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    }, 
    author: {
        type: String
    },
    video: {
        type: String
    },
    image: {
        type: String
    },
    comments: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
})

let Story = mongoose.model("Story", storySchema);
module.exports = Story;
