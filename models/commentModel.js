const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let commentSchema = new Schema = {
	user: {
		type: String,
		required: true
	},
	comment: {
		type: String,
		required: true
	}
} 

let Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;