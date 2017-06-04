let express = require("express");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let logger = require("morgan");
mongoose.Promise = Promise;
let Story = require("./models/storyModel.js");
let Comment = require("./models/commentModel.js");
let request = require("request");
let cheerio = require("cheerio");
let app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongod://localhost/mlbScrape");
// mongoose.connect("mongodb://heroku_ss9vnr07:hcfvfvote8cqjg9i06fn703ra6@ds161041.mlab.com:61041/heroku_ss9vnr07");
const db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose Connection Successful");
})

app.get("/scrape", function(req, res){
	request("http://m.mlb.com/news/", function(err, res, html){
		let $ = cheerio.load(html);

		$("#bam-article").each(function(i, element){
			let result = {};
			result.headline = $(this).attr("data-title");
			let entry = new Story(result);
			entry.save(function(err, data){
				err ? console.log(err) : console.log(data);
			})
		})
	})
	res.send("Scrap Successful");
})







app.listen(3000, function() {
    console.log("App running on port 3000!");
});
