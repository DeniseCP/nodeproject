const express = require('express');
const router = express.Router();

// Article Model
let Article = require('../models/article');
// User Model
let User = require('../models/user');

// Add route
router.get('/add', ensureAuth, (_req, resp) => {
    resp.render('add_article', {
        title: 'Add Article',
    });
});


// Add Submit Post Route
router.post('/add', async (req, resp) => {

    req.checkBody('title', 'Title is required').notEmpty();
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
        // @ts-ignore
        article.author = req.user.id || null;
        article.body = req.body.body;

        await article.save()
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
        .then((art) => {
            User.findById(art?.author)
                .then((user) => {
                    resp.render('article', {
                        article: art,
                        author: user?.name
                    });
                });
        })
        .catch((err) => console.log(err));
});

// Load Edit Article Route

router.get('/edit/:id', ensureAuth, (req, resp, next) => {
    Article.findById(req.params.id)
        .then((art) => {
            // @ts-ignore
            if (req.user?.id === art.author) {
                resp.render('edit_article', {
                    title: 'Edit Article',
                    article: art
                });
            } else {
                req.flash('danger', 'Action not authorized.');
                resp.redirect('/');
                next();
            }
        })
        .catch((err) => console.log(err));
});

// Update Submit Post Route
router.post('/edit/:id', ensureAuth, (req, resp) => {
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
router.delete('/:id', ensureAuth, async (req, resp) => {
    let query = { _id: req.params.id };

    setTimeout(() => Article.findById(req.params.id)
        .then((_err, article) => {
            // @ts-ignore
            if (article?.author !== req.user?._id) {
                resp.status(500).send();
            } else {
                Article.deleteOne(query)
                    .then(() => {
                        resp.send('Success');
                    })
                    .catch((err) => console.log(err));
            }
        }), 1000);
});

// Access Control
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;
