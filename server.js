let express = require("express");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
// let logger = require("morgan");
mongoose.Promise = Promise;
let Story = require("./models/storyModel.js");
let Comment = require("./models/commentModel.js");
let request = require("request");
let cheerio = require("cheerio");
let app = express();
let PORT = process.env.PORT || 3000;
let exphbs = require("express-handlebars");
let moment = require("moment");

// app.use(logger("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(express.static(__dirname + '/public'));

app.use(express.static("/public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


if (process.env.NODE_ENV == 'production') {
    mongoose.connect("mongodb://heroku_ss9vnr07:hcfvfvote8cqjg9i06fn703ra6@ds161041.mlab.com:61041/heroku_ss9vnr07");
} else {
    mongoose.connect("mongodb://localhost/mlbScrape");
}

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
    Story.find({}).sort({ timestamp: -1 }).exec(function(err, data) {
        // console.log(data)
        err ? res.json(err) : res.render("index", { Story: data });
    })
})


app.get("/scrape", function(req, res) {
    request("http://www.mlb.com/news/", function(error, response, html) {
        let $ = cheerio.load(html);
        $(".bam-article").each(function(i, element) {
            let result = {};
            result.headline = $(this).attr("data-title");
            result.data_id = $(this).attr("data-contentid");
            let html = $(this).attr("data-seo-title").replace(/ /g, "-").replace(/,/g, "").replace(/'/g, "").replace(/\./g, "");
            result.link = html;
            let createdAt = $(this).attr("data-timestamp");
            let formattedTime = moment(createdAt, "YYYY-MM-DDTHH:mm:ss-ZZ").format("MMMM-Do-YYYY hh:mmA");
            result.timestamp = $(this).attr("data-timestamp");
            result.moment = formattedTime;
            result.text = $(this).find(".default-styles").text().replace(/Full Game Coverage/, "");
            result.author = $(this).attr("data-author");
            result.video = $(this).find(".video-link").attr("data-video-link");
            result.image = $(this).find(".main-image").attr("data-src");
            let entry = new Story(result);
            entry.save(function(err, data) {
                // err ? console.log(err) : console.log(data);
            })
        })
    })
    res.redirect("back")
})

app.get("/stories", function(req, res) {
    Story.find({}, function(err, data) {
        err ? res.json(err) : res.json(data);
    })
})

app.get("/stories/:id", function(req, res) {
    Story.findById(req.params.id).populate("comment").exec(function(err, data) {
        // console.log(data)
        err ? res.json(err) : res.render("comments", { Story: data })
    })
})

app.post("/stories/:id", function(req, res) {
    // console.log(req.body.comments)
    // console.log(req.params.id)
    let newComment = {};
    newComment.comment = req.body.comments;
    let saveComment = new Comment(newComment);
    saveComment.save(function(err, data) {
        console.log(data._id)
        err ? console.log(err) :
            Story.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comment": data._id } }).exec(function(err, doc) {
                console.log(doc)
                err ? console.log(err) : res.redirect("/stories/" + req.params.id)
            })
    })
})

app.get("/saved", function(req, res) {
    Story.find({ 'saved': true }, function(err, doc) {
        err ? console.log(err) : res.render("favorites", { favorites: doc })
    })
})


app.post('/saved/:id', function(req, res) {
    Story.update({ '_id': req.params.id }, { $set: { 'saved': true } }, function(err, doc) {
        res.redirect('/saved');
    })
});

app.post('/unsaved/:id', function(req, res) {
    Story.update({ '_id': req.params.id }, { $set: { 'saved': false } }, function(err, doc) {
        res.redirect('/saved');
    });
});

app.listen(process.env.PORT || PORT, function() {
    console.log("App running on port 3000!");
});
