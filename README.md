# Facebook Login for 🤖 robots

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/hfreire/facebook-login-for-robots.svg?branch=master)](https://travis-ci.org/hfreire/facebook-login-for-robots)
[![Coverage Status](https://coveralls.io/repos/github/hfreire/facebook-login-for-robots/badge.svg?branch=master)](https://coveralls.io/github/hfreire/facebook-login-for-robots?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/hfreire/facebook-login-for-robots.svg)](https://greenkeeper.io/)
[![](https://img.shields.io/github/release/hfreire/facebook-login-for-robots.svg)](https://github.com/hfreire/facebook-login-for-robots/releases)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/npm/v/facebook-login-for-robots.svg)](https://www.npmjs.com/package/facebook-login-for-robots)
[![Downloads](https://img.shields.io/npm/dt/facebook-login-for-robots.svg)](https://www.npmjs.com/package/facebook-login-for-robots) 

> Uses a headless browser to perform a Facebook Login ([OAuth dialog](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)) in a Facebook App.

### Features
* Retries :shit: failing requests in temporary and unexpected system and :boom: network failures :white_check_mark:
* Uses [Brakes](https://github.com/awolden/brakes) circuit breakers to :hand: fail-fast until it is safe to retry :white_check_mark: 
* Supports [Bluebird](https://github.com/petkaantonov/bluebird) :bird: promises :white_check_mark:

### How to install
```
npm install facebook-login-for-robots
```

### How to use

#### Use it in your app
Use Facebook Login to get an access token for a Facebook App
```javascript
const FacebookLogin = require('facebook-login-for-robots')

const facebookLogin = new FacebookLogin({
  facebook: {
    email: 'my-facebook-email-address', 
    password: 'my-facebook-passsword'
  }
})

const clientId = 'my-facebook-app-id'
const redirectUri = 'my-facebook-app-redirect-uri'

facebookLogin.oauthDialog(clientdId, redirectUri)
  .then(({ facebookAccessToken }) => console.log(facebookAccessToken))
  .catch((error) => console.error(error))
```

### Used by
* [get-me-a-date](https://github.com/hfreire/get-me-a-date) - :heart_eyes: Help me get a :cupid: date tonight :first_quarter_moon_with_face:
