// -- Links resolution rules
// This function will be used to generate links to Prismic.io documents
// As your project grows, you should update this function according to your routes
linkResolver: function(doc, ctx) {
  if (doc.type == 'albums') {
    return '/album';
  }
  if (doc.type == 'album') {
    return '/album/' + encodeURIComponent(doc.uid);
  }
  if (doc.type == 'musicians') {
    return '/musician/' + encodeURIComponent(doc.uid);
  }
  if (doc.type == 'artists') {
    return '/artist/' + encodeURIComponent(doc.uid);
  }
  if (doc.type == 'mediums') {
    return '/mediums/' + encodeURIComponent(doc.uid);
  }
  if (doc.type == 'genres') {
    return '/genres/' + encodeURIComponent(doc.uid);
  }
  return '/';
}
};
