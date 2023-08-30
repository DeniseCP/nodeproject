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
let User = require('./models/user');


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
    resave: true,
    saveUninitialized: true,
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

// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/articles', articles);
app.use('/users', users);

// Start server
app.listen(3000, () => {

    console.log('Server started on port 3000');
});
