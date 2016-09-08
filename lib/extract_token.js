'use strict';

var auth_hdr = require('./auth_header');

// ExpressJS convierte todos los headers a minúsculas
var AUTH_HEADER = "authorization",
    DEFAULT_AUTH_SCHEME = "JWT";

module.exports = function(request) {
  var token = null;

  if (request.headers[AUTH_HEADER]) {
    var auth_params = auth_hdr.parse(request.headers[AUTH_HEADER]);

    if (auth_params) {
      token = auth_params.value;
    }
  }

  return token;
};
