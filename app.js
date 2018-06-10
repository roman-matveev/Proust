var express          = require('express'),
    bodyParser       = require('body-parser'),
    methodOverride   = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose         = require('mongoose'),
    app              = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
mongoose.connect("mongodb://localhost/proust");

var proustSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Proust = mongoose.model("Proust", proustSchema);

app.get("/", function(req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res) {
    Proust.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs:blogs});
        }
    });
});

app.get("/blogs/new", function(req, res) {
    res.render("new");
});

app.post("/blogs", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Proust.create(req.body.blog, function(err, newPost) {
        if (err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", function(req, res) {
    Proust.findById(req.params.id, function(err, foundPost) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog:foundPost});
        }
    });
});

app.get("/blogs/:id/edit", function(req, res) {
    Proust.findById(req.params.id, function(err, foundPost) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog:foundPost});
        }
    });
});

app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Proust.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedPost) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

app.delete("/blogs/:id", function(req, res) {
    Proust.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(8000, function() {
    console.log("Running server on port 8000.");
});
