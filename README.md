# Facebook Login for 🤖 robots

[![Build Status](https://travis-ci.org/hfreire/facebook-login-for-robots.svg?branch=master)](https://travis-ci.org/hfreire/facebook-login-for-robots)
[![Coverage Status](https://coveralls.io/repos/github/hfreire/facebook-login-for-robots/badge.svg?branch=master)](https://coveralls.io/github/hfreire/facebook-login-for-robots?branch=master)
[![](https://img.shields.io/github/release/hfreire/facebook-login-for-robots.svg)](https://github.com/hfreire/facebook-login-for-robots/releases)
[![Version](https://img.shields.io/npm/v/facebook-login-for-robots.svg)](https://www.npmjs.com/package/facebook-login-for-robots)
[![Downloads](https://img.shields.io/npm/dt/facebook-login-for-robots.svg)](https://www.npmjs.com/package/facebook-login-for-robots) 

> Uses a headless browser to perform a Facebook Login ([OAuth dialog](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)) in a Facebook App.

### Features
* Uses [Perseverance](https://github.com/hfreire/perseverance) to add :raised_hand: rate limit, :poop: retry and :traffic_light: circuit breaker behaviour to your requests :white_check_mark:  
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
  },
  // puppeteer: {
  //   headless: false // helpful for troubleshooting
  // }
})

const clientId = 'my-facebook-app-id'
const redirectUri = 'my-facebook-app-redirect-uri'

facebookLogin.oauthDialog(clientId, redirectUri)
  .then(({ facebookAccessToken }) => console.log(facebookAccessToken))
  .catch((error) => console.error(error))
```

### How to contribute
You can contribute either with code (e.g., new features, bug fixes and documentation) or by [donating 5 EUR](https://paypal.me/hfreire/5). You can read the [contributing guidelines](CONTRIBUTING.md) for instructions on how to contribute with code. 

All donation proceedings will go to the [Sverige för UNHCR](https://sverigeforunhcr.se), a swedish partner of the [UNHCR - The UN Refugee Agency](http://www.unhcr.org), a global organisation dedicated to saving lives, protecting rights and building a better future for refugees, forcibly displaced communities and stateless people.

### Used by
* [get-me-a-date](https://github.com/hfreire/get-me-a-date) - :heart_eyes: Help me get a :cupid: date tonight :first_quarter_moon_with_face:

### License
Read the [license](./LICENSE.md) for permissions and limitations.
