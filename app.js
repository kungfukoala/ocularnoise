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

function render404(req, res) {
  res.status(404);
  res.render('404');
}

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

    if (!home) {
      render404(req, res);
    }

    var queryOptions = {
      page: req.params.p || '1',
      orderings: '[my.album.date desc]',
      fetchLinks: 'artists.name, mediums.name, genres.name'
    };

    // Query the posts
    return req.prismic.api.query(
      prismic.Predicates.at("document.type", "album"),
      queryOptions
    ).then(function(response) {

      // Render the blog homepage
      res.render('home', {
        home,
        albums: response.results
      });
    });
  })
);

/**
* Route for album page
*/
app.get('/album/:uid', (req, res) => {

  var uid = req.params.uid;

  var queryOptions = {
    fetchLinks: 'artists.name, mediums.name, genres.name'
  };

  req.prismic.api.getByUID('album', uid, queryOptions).then(album => {

    if (!album) {
      render404(req, res);
    }

    res.render('album', {album: album});
  });
});

/**
* Route for artist page
*/
app.get('/artist/:uid', (req, res) => {

  var uid = req.params.uid;

  req.prismic.api.getByUID('artists', uid).then(artist => {

    if (!artist) {
      render404(req, res);
    }

    res.render('artists', {artist: artist});
  });
});

// Route for Mediums
app.route('/mediums/:uid').get(function(req, res) {

  // Define the UID EX. Typography
  var uid = req.params.uid;

  // Query the Medium by UID EX. Typography
  req.prismic.api.getByUID('mediums', uid).then(function(medium) {

    // Render the 404 if the UID is not found
    if (!medium) {
      render404(req, res);
    }

    // Define the ID
    var mediumID = medium.id;

    // Query
    req.prismic.api.query([
      // All the albums
        prismic.Predicates.at('document.type', 'album'),
        // Any albums with the medium ID. EX. Typography linked to albums
        prismic.Predicates.at('my.album.mediums.link', mediumID)
      ], { orderings : '[my.album.date desc]'}
    ).then(function(albums) {

      // Render the listing page
      res.render('list', {albums: albums.results});
    });

  });
});

// 404
app.route('/:url').get(function(req, res) {
  render404(req, res);
});
