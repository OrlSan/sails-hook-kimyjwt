# KimyJWT

[Sails.js](http://sailsjs.org) hook for JWT-based authentication, for humans.

If you're looking for using [JSON Web Tokens](https://jwt.io/) on your Sails
apps, you're on the right place.

# Use

Install with

`$ npm install sails-hook-kimyjwt`

And then create the config on `config/kimyjwt.js`

```javascript
module.exports.kimyjwt = {
  // Required
  model: "user",
  secretField: "secret",
  // Optional
  idField: "id", // This is an attribute in the model
}
```

Next, you should only add the `kimyjwt` policy to the routes you require the
authentication and you're done:

```javascript
'get /user/protected/route': [{
    policy: 'kimyjwt'
  }, {
    controller: 'UserController',
    action: 'mySecureRoute'
  }]
```

# Contribute
All PR and Issues are welcome. You can get in touch with
[@SoyOrlSan](http://twitter.com/SoyOrlSanM) too.

# About

(C) 2016, Orlando Sánchez & Jorge Santiago Álvarez, Grupo Jaque.
