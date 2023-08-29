const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../models/article');

// Add route
router.get('/add', (req, resp) => {
    resp.render('add_article', {
        title: 'Add Article',
    });
});


// Add Submit Post Route
router.post('/add', (req, resp) => {

    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        resp.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;

        article.save()
            .then(() => {
                req.flash('success', 'Article Added');
                resp.redirect('/');
            })
            .catch((err) => console.log(err));
    }
});

// Get Single Route
router.get('/:id', (req, resp) => {
    Article.findById(req.params.id)
        .then((art) => resp.render('article', {
            article: art
        }))
        .catch((err) => console.log(err));
});

// Load Edit Article Route

router.get('/edit/:id', (req, resp) => {
    Article.findById(req.params.id)
        .then((art) => resp.render('edit_article', {
            title: 'Edit Article',
            article: art
        }))
        .catch((err) => console.log(err));
});

// Update Submit Post Route
router.post('/edit/:id', (req, resp) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id };

    Article.updateOne(query, article)
        .then(() => {
            req.flash('success', 'Article Saved');
            resp.redirect('/');
        })
        .catch((err) => console.log(err));
});

// Delete Article
router.delete('/:id', (req, resp) => {
    let query = { _id: req.params.id };
    Article.deleteOne(query)
        .then(() => {
            resp.send('Success');
        })
        .catch((err) => console.log(err));

});


module.exports = router;
