const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let storySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comment: {
        type: Schema.Types.ObjectID,
        ref: "Comment"
    }
})

let Story = mongoose.model("Story", storySchema);
module.exports = Story;
