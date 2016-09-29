# Kimy JWT

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

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
  passportLike: false // defaults to true
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

## Options

### Passport.js-like API

If you enable the Passport.js-like API then you can use the `req.user` object
as you usually do in a Passport.js-based application:

```javascript
// UserController

module.exports = {
	secureRoute: function(req, res) {
		res.json({
			success: true,
			message: "Welcome, " + req.user.name // Name is a property in the model
		});
	}
};
```

### Magic Object in `req.user`

With the `passportLike` option enabled, the hook can attach the full model
object to the `req.user` object. This adds the possibility to the following
code to be used:

```javascript
// someController.js

module.exports = {
  myRoute: function(req, res) {
    req.user.someMethodInTheModel();
    // ...

    res.json({
      "success": true,
      "message": "Well done, " + req.user.name + "!"
    });
  }
};
```

For doing so just add the `magicObject` setting to true in the options

```javascript
module.exports.kimyjwt = {
  // Required
  model: "user",
  secretField: "secret",
  // Optional
  idField: "id", // This is an attribute in the model
  passportLike: true, // defaults to true
  magicObject: true // defaults to false
}
```

# Contribute
All PR and Issues are welcome. You can get in touch with
[@SoyOrlSan](http://twitter.com/SoyOrlSanM) too.

# About

(C) 2016, Orlando Sánchez & Jorge Santiago Álvarez, Grupo Jaque.


[npm-image]: https://img.shields.io/npm/v/sails-hook-kimyjwt.svg
[npm-url]: https://npmjs.org/package/sails-hook-kimyjwt
[downloads-image]: https://img.shields.io/npm/dm/sails-hook-kimyjwt.svg
[downloads-url]: https://npmjs.org/package/sails-hook-kimyjwt
