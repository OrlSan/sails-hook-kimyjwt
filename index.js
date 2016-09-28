var JWT = require('jsonwebtoken');
var ext_token = require('./lib/extract_token');

module.exports = function indexes(sails) {
  return {
    // Default config
    defaults: {
      kimyjwt: {
        idField: "id"
      }
    },

    // Hook config. None by now...
    configure: function() {},

    // Hook logic
    initialize: function(done) {
      var eventsToWaitFor = ["hook:orm:loaded", "hook:http:loaded", "hook:policies:loaded"];

      sails.after(eventsToWaitFor, function() {
        // Required fields config
        var UserModel = sails.models[sails.config.kimyjwt.model];
        var secretField = sails.config.kimyjwt.secretField;
        var idField = sails.config.kimyjwt.idField;

        var fields = {
          secretField: secretField,
          idField: idField
        }

        //Check responses
        if(!sails.config.kimyjwt.errorResponses){
          sails.config.kimyjwt.errorResponses = {};
        }
        if(Object.keys(sails.config.kimyjwt.errorResponses)!=[0,1,2,3,4]){
          if(!sails.config.kimyjwt.errorResponses[0]){
            sails.config.kimyjwt.errorResponses[0] = {
              name: 'missingToken',
              message: "Missing Token"
            };
            sails.hooks.responses.middleware.missingToken = function(message) {
              return res.status(401).send(message);
            };
            sails.hooks.responses.middleware.missingToken.globalId = 'missingToken';
            sails.hooks.responses.middleware.missingToken.identity = 'missingtoken'
          }
          if(!sails.config.kimyjwt.errorResponses[1]){
            sails.config.kimyjwt.errorResponses[1] = {
              name: 'failDecode',
              message: "Fail Decode"
            };
            sails.hooks.responses.middleware.failDecode = function(message) {
              return res.status(401).send(message);
            };
            sails.hooks.responses.middleware.failDecode.globalId = 'failDecode';
            sails.hooks.responses.middleware.failDecode.identity = 'faildecode'
          }
          if(!sails.config.kimyjwt.errorResponses[2]){
            sails.config.kimyjwt.errorResponses[2] = {
              name: 'baseError',
              message: "Base Error"
            };
            sails.hooks.responses.middleware.baseError = function(message) {
              return res.status(500).send(message);
            };
            sails.hooks.responses.middleware.baseError.globalId = 'baseError';
            sails.hooks.responses.middleware.baseError.identity = 'baseerror'
          }
          if(!sails.config.kimyjwt.errorResponses[3]){
            sails.config.kimyjwt.errorResponses[3] = {
              name: 'jWTFail',
              message: "JWT Fail"
            };
            sails.hooks.responses.middleware.jWTFail = function(message) {
              return res.status(401).send(message);
            };
            sails.hooks.responses.middleware.jWTFail.globalId = 'jWTFail';
            sails.hooks.responses.middleware.jWTFail.identity = 'jwtfail'
          }
          if(!sails.config.kimyjwt.errorResponses[4]){
            sails.config.kimyjwt.errorResponses[4] = {
              name: 'notMatching',
              message: "Not Matching User"
            };
            sails.hooks.responses.middleware.notMatching = function(message) {
              return res.status(401).send(message);
            };
            sails.hooks.responses.middleware.notMatching.globalId = 'notMatching';
            sails.hooks.responses.middleware.notMatching.identity = 'notmatching'
          }
        }

        // Create the policy
        sails.hooks.policies.middleware.kimyjwt = verify(UserModel, fields);
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

function verify(model, fields) {
  return function(req, res, next) {
    var token = ext_token(req);

    if (token == null) {
      return res[sails.config.kimyjwt.errorResponses[0].name](sails.config.kimyjwt.errorResponses[0].message);
    }

    var decoded = JWT.decode(token, { complete: true });

    if (decoded == null) {
      // In this case something but not a valid JWT was provided to the
      // Auth Header, so we'll dismiss the request
      return res[sails.config.kimyjwt.errorResponses[1].name](sails.config.kimyjwt.errorResponses[1].message);
    }

    // In case the Payload can be obtained so we'll move on to the Auth process
    var payload = decoded.payload;

    var searchQuery = {};
    searchQuery[fields.idField] = payload.sub;

    model.findOne(searchQuery).exec(function(errFind, foundUser) {
      if (errFind) {
        return res[sails.config.kimyjwt.errorResponses[2].name](sails.config.kimyjwt.errorResponses[2].message);
      }

      if (foundUser) {
        // Verify whether the JWT signature is valid or not
        JWT.verify(token, foundUser.secret, function(errToken, decoded) {
          if (errToken) {
            return res[sails.config.kimyjwt.errorResponses[3].name](sails.config.kimyjwt.errorResponses[3].message);
          }

          // When no error found the verification got success
          req.user = foundUser.toJSON();
          return next();
        });
      } else {
        // There's no matching user on the database, so you're unauthorized
        return res[sails.config.kimyjwt.errorResponses[4].name](sails.config.kimyjwt.errorResponses[4].message);
      }
    });
  };
}
