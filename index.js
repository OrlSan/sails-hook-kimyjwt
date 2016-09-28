var JWT = require('jsonwebtoken');
var ext_token = require('./lib/extract_token');

module.exports = function indexes(sails) {
  return {
    // Default config
    defaults: {
      kimyjwt: {
        idField: "id",
        passportLike: true
      }
    },

    // Hook config. None by now...
    configure: function() {

    },

    // Hook logic
    initialize: function(done) {
      var eventsToWaitFor = ["hook:orm:loaded", "hook:http:loaded", "hook:policies:loaded"];

      sails.after(eventsToWaitFor, function() {
        // Hook configs
        var UserModel    = sails.models[sails.config.kimyjwt.model];
        var secretField  = sails.config.kimyjwt.secretField;
        var idField      = sails.config.kimyjwt.idField;
        var passportLike = sails.config.kimyjwt.passportLike;

        var options = {
          secretField: secretField,
          idField: idField,
          passportLike: passportLike
        }

        // Create the policy
        sails.hooks.policies.middleware.kimyjwt = verify(UserModel, options);
        sails.hooks.policies.middleware.kimyjwt.identity = "kimyjwt";
        sails.hooks.policies.middleware.kimyjwt.globalId = "kimyjwt";
        sails.hooks.policies.middleware.kimyjwt.sails = sails;
      });

      done();
    },

    // Routes
    routes: {}
  }
};

function verify(model, options) {
  return function(req, res, next) {
    var token = ext_token(req);

    if (token == null) {
      return res.status(401).send("Unauthorized");
    }

    var decoded = JWT.decode(token, { complete: true });

    if (decoded == null) {
      // In this case something but not a valid JWT was provided to the
      // Auth Header, so we'll dismiss the request
      return res.status(401).send("Unauthorized");
    }

    // In case the Payload can be obtained so we'll move on to the Auth process
    var payload = decoded.payload;

    var searchQuery = {};
    searchQuery[options.idField] = payload.sub;

    model.findOne(searchQuery).exec(function(errFind, foundUser) {
      if (errFind) {
        return res.status(500).send("Internal server error");
      }

      if (foundUser) {
        // Verify whether the JWT signature is valid or not
        JWT.verify(token, foundUser.secret, function(errToken, decoded) {
          if (errToken) {
            return res.status(401).send("Unauthorized");
          }

          // When no error found the verification got success, so we can add
          // the Passport-like behavior if needed and proceed with next()
          if (options.passportLike) req.user = foundUser.toJSON();

          return next();
        });
      } else {
        // There's no matching user on the database, so you're unauthorized
        return res.status(401).send("Unauthorized");
      }
    });
  };
}
