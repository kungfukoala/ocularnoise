/**
 * Module dependencies.
 */
var prismic = require('prismic-nodejs');
var app = require('./config');
var configuration = require('./prismic-configuration');
var PORT = app.get('port');

/**
* Start the server
*/
app.listen(PORT, function() {
  console.log('Point your browser to http://localhost:' + PORT);
});

/**
* Middleware to connect to the prismic.io API
*/
app.use((req, res, next) => {
  prismic.api(configuration.apiEndpoint, {accessToken: configuration.accessToken, req})
    .then(api => {
      req.prismic = {api};
      res.locals.ctx = {
        endpoint: configuration.apiEndpoint,
        linkResolver: configuration.linkResolver
      };
      next();
    }).catch(err => {
      if (err.status === 404) {
        res.status(404).send("There was a problem connecting to your API, please check your configuration file for errors.");
      } else {
        res.status(500).send("Error 500: " + err.message);
      }
    });
});

/**
* Preconfigured prismic preview
*/
app.get('/preview', (req, res) =>
  prismic.preview(req.prismic.api, configuration.linkResolver, req, res)
);

/**
* ROUTES
*/

/**
* Route for blog homepage
*/
app.get(['/', '/album'], (req, res) =>

  // Query the homepage
  req.prismic.api.getSingle("home").then(home => {

    // If a document is returned...
    if(home) {

      var queryOptions = {
        page: req.params.p || '1',
        orderings: '[my.album.date desc]',
        fetchLinks: 'artists.name'
      };

      // var terms = req.query.terms;

      // Query the posts
      return req.prismic.api.query(
        prismic.Predicates.at("document.type", "album"),
        // prismic.Predicates.fulltext("document", terms),
        queryOptions
      ).then(function(response) {

        // Render the blog homepage
        res.render('home', {
          home,
          albums: response.results
        });
      });

    } else {
      // If a bloghome document is not returned, give an error
      res.status(404).send('Not found');
    }
  })
);

/**
* Route for album posts
*/
app.get('/album/:uid', (req, res) => {

  // Define the uid from the url
  var uid = req.params.uid;

  // Query the post by its uid
  req.prismic.api.getByUID('album', uid, {'fetchLinks': 'artists.name'}).then(album => {

    if(album) {
      // If a document is returned, render the post
      res.render('album', {album: album});
    } else {
      // Else give an error
      res.status(404).send('Not found');
    }
  });
});

/**
* Route for artist page
*/
app.get('/artist/:uid', (req, res) => {

  // Define the uid from the url
  var uid = req.params.uid;

  // Query the post by its uid
  req.prismic.api.getByUID('artists', uid).then(artist => {

    if(artist) {
      // If a document is returned, render the post
      res.render('artists', {artist: artist});
    } else {
      // Else give an error
      res.status(404).send('Not found');
    }
  });
});
