const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let commentSchema = new Schema({
	comment: {
		type: String,
	}
})

let Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;