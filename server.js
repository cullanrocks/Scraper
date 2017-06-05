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
let PORT = process.env.PORT || 3000;
let exphbs = require("express-handlebars");

app.use(logger("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(express.static(__dirname + '/public'));

app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/mlbScrape");
// mongoose.connect("mongodb://heroku_ss9vnr07:hcfvfvote8cqjg9i06fn703ra6@ds161041.mlab.com:61041/heroku_ss9vnr07");
const db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose Connection Successful");
})

let routes = require("./controllers/story_controller.js")
// app.use("/", routes);


app.get("/", function(req, res) {
	console.log(req)
	console.log(res)
    Story.find({}, function(err, data) {
    	console.log(err)
        console.log(data)
        let hbsObject = {
            story: data
        };
        console.log(hbsObject)
        err ? res.json(err) : res.render("index", hbsObject)
            // err ? res.json(err) : res.json(data);
            // res.render("index", hbsObject)

    })
});






app.get("/scrape", function(req, res) {
    request("http://www.mlb.com/news/", function(error, response, html) {
        let $ = cheerio.load(html);
        $(".bam-article").each(function(i, element) {
            let result = {};
            result.headline = $(this).attr("data-title");
            result.link = $(this).attr("data-url");
            result.data_id = $(this).attr("data-contentid");
            result.timestamp = $(this).attr("data-timestamp");
            result.author = $(this).attr("data-author");
            result.video = $(this).find(".video-link").attr("data-video-link");
            result.image = $(this).find(".main-image").attr("data-src");
            let entry = new Story(result);
            entry.save(function(err, data) {
                err ? console.log(err) : console.log(data);
            })
        })
    })
    res.send("Scrape Successful");
})





app.get("/stories", function(req, res) {
    Story.find({}, function(err, data) {
        err ? res.json(err) : res.json(data);
    })
})

app.get("/stories/:id", function(req, res) {
    Story.findById(req.params.id).populate("comments").exec(function(err, doc) {
        err ? res.json(err) : res.json(doc)
    })
})


app.listen(PORT, function() {
    console.log("App running on port 3000!");
});
