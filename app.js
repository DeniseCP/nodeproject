const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

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

// Home router
app.get('/', async (req, resp) => {
    const articles = await Article.find({});

    resp.render('index', {
        title: 'Articles',
        articles: articles
    });

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
