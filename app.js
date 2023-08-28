const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const messages = require('express-messages');
const flash = require('connect-flash');
const expressValidator = require('express-validator');

// MongoDB connection
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check for DB errors
db.once('open', () => {
    console.log('Connect to mongoDB');
});

db.on('error', (err) => {
    console.log(err);
});

// init app
const app = express();

// Bring in models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Boody Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Set Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express-Session Midware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// Express messages middleware
app.use(flash());
app.use((req, resp, next) => {
    resp.locals.messages = messages(req, resp);
    next();
});

// Express Validator Middleware
const validatorOptions = {
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.'),
            root = namespace.shift,
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
};
app.use(expressValidator(validatorOptions));

// Home router
app.get('/', async (req, resp) => {
    const articles = await Article.find({});

    resp.render('index', {
        title: 'Articles',
        articles: articles
    });

});

// Get Single Route
app.get('/article/:id', (req, resp) => {
    Article.findById(req.params.id)
        .then((art) => resp.render('article', {
            article: art
        }))
        .catch((err) => console.log(err));
});

// Load Edit Article Route

app.get('/article/edit/:id', (req, resp) => {
    Article.findById(req.params.id)
        .then((art) => resp.render('edit_article', {
            title: 'Edit Article',
            article: art
        }))
        .catch((err) => console.log(err));
});

// Update Submit Post Route
app.post('/articles/edit/:id', (req, resp) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id };

    Article.updateOne(query, article)
        .then(() => resp.redirect('/'))
        .catch((err) => console.log(err));
});

// Delete Article
app.delete('/articles/:id', (req, resp) => {
    let query = { _id: req.params.id };
    Article.deleteOne(query)
        .then(() => {
            resp.send('Success');
        })
        .catch((err) => console.log(err));

});

// Add route
app.get('/articles/add', (req, resp) => {
    resp.render('add_article', {
        title: 'Add Article',
    });
});


// Add Submit Post Route
app.post('/articles/add', (req, resp) => {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save()
        .then(() => resp.redirect('/'))
        .catch((err) => console.log(err));
});

// Start server
app.listen(3000, () => {

    console.log('Server started on port 3000');
});
