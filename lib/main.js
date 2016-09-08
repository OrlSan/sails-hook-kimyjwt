// Exports function to use on the App
module.exports = function(req, res, next) {
  var token = ext_token(req);

  if (token == null) {
    return res.status(401).send("Unauthorized");
  }

  var decoded = JWT.decode(token, { complete: true });
  var payload = decoded.payload;

  User.findOne({ email: payload.sub }).lean().exec(function(errFind, foundUser) {
    if (errFind) {
      return res.status(500).send("Internal server error");
    }

    if (foundUser) {
      // Verify whether the JWT signature is valid or not
      JWT.verify(token, foundUser.secret, function(errToken, decoded) {
        if (errToken) {
          return res.status(401).send("Unauthorized");
        }

        // When no error found the verification got success
        req.user = foundUser;
        return next();
      });
    } else {
      // No se encontró el usuario solicitado
      return res.status(401).send("Unauthorized");
    }
  });
};
