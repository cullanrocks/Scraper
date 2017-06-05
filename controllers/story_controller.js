let express = require("express");
let router = express.Router();
let Story = require("../models/storyModel.js");
let Comment = require("../models/commentModel.js");


// router.get("/", function(req, res) {
//     Story.find({}, function(err, data) {
//         console.log(data)
//         let hbsObject = {
//             story: data
//         };
//         console.log(hbsObject)
//         err ? res.json(err) : res.render("index", hbsObject)
//         // err ? res.json(err) : res.json(data);
//         // res.render("index", hbsObject)

//     })
// });



module.exports = router;
