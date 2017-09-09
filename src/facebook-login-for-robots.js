/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const BASE_URL = 'https://www.facebook.com/dialog/oauth'

const _ = require('lodash')
const Promise = require('bluebird')
const retry = require('bluebird-retry')
const Brakes = require('brakes')

const Nightmare = require('nightmare')
Nightmare.Promise = Promise

const RandomHttpUserAgent = require('random-http-useragent')

const { join } = require('path')
const querystring = require('querystring')

const buildUrl = function (clientId, redirectUri, optionalParams) {
  const params = _.assign({
    client_id: clientId,
    redirect_uri: redirectUri
  }, optionalParams)

  return `${BASE_URL}?${querystring.stringify(params, null, null, { encodeURIComponent: (s) => s })}`
}

const login = function (url, userAgent) {
  let facebookUserId
  let facebookAccessToken

  let redirectUri
  const match = url.match(/redirect_uri=(.*?)(&|$)/)
  if (_.size(match) > 1) {
    redirectUri = match[ 1 ]
  }

  const nightmare = Nightmare(this._options.nightmare)

  return nightmare
    .useragent(userAgent)
    .on('page', function (type, url, method, response) {
      if (type !== 'xhr-complete') {
        return
      }

      if (url.path === '/pull' && !facebookUserId) {
        const match = response.match(/"u":(.*),"ms"/)
        if (_.size(match) > 1) {
          facebookUserId = match[ 1 ]
        }

        return
      }

      if (_.includes(url, 'www.facebook.com/ajax/haste-response') && !facebookUserId) {
        const match = url.match(/__user=([0-9]+)/)
        if (_.size(match) > 1) {
          facebookUserId = match[ 1 ]
        }

        return
      }

      if (_.includes(url, 'oauth/confirm?dpr') && !facebookAccessToken) {
        const match = response.match(/access_token=(.*?)(&|$)/)
        if (_.size(match) > 1) {
          facebookAccessToken = match[ 1 ]
        }
      }
    })
    .on('did-get-redirect-request', function (event, oldUrl, newUrl) {
      if (_.startsWith(newUrl, redirectUri) && !facebookAccessToken) {
        const match = newUrl.match(/#access_token=(.*?)(&|$)/)
        if (_.size(match) > 1) {
          facebookAccessToken = match[ 1 ]
        }
      }
    })
    .goto('https://facebook.com')
    .type('input#email', this._options.facebook.email)
    .type('input#pass', this._options.facebook.password)
    .click('#loginbutton input')
    .wait(3000)
    .goto(url)
    .then(() => {
      if (_.startsWith(redirectUri, 'fb')) {
        return nightmare
          .wait('button._42ft._4jy0.layerConfirm._1flv._51_n.autofocus.uiOverlayButton._4jy5._4jy1.selected._51sy')
          .click('button._42ft._4jy0.layerConfirm._1flv._51_n.autofocus.uiOverlayButton._4jy5._4jy1.selected._51sy')
      } else {
        return nightmare
      }
    })
    .then(() => {
      return nightmare
        .wait(10000)
        .end()
    })
    .then(() => {
      if (!facebookAccessToken || !facebookUserId) {
        throw new Error('unable to login')
      }

      return { facebookAccessToken, facebookUserId }
    })
}

const defaultOptions = {
  facebook: {},
  nightmare: {
    show: false,
    partition: 'nopersist',
    webPreferences: {
      preload: join(__dirname, '/preload.js'),
      webSecurity: false
    }
  },
  retry: { max_tries: 3, interval: 15000, timeout: 80000, throw_original: true },
  breaker: { timeout: 120000, threshold: 80, circuitDuration: 3 * 60 * 60 * 1000 }
}

class FacebookLoginForRobots {
  constructor (options = {}) {
    this._options = _.defaultsDeep(options, defaultOptions)

    this._breaker = new Brakes(this._options.breaker)

    this._loginCircuitBreaker = this._breaker.slaveCircuit((...params) => retry(() => login.bind(this)(...params), this._options.retry))
  }

  get circuitBreaker () {
    return this._breaker
  }

  oauthDialog (clientId, redirectUri, optionalParams = {}) {
    if (!clientId || !redirectUri) {
      return Promise.reject(new Error('invalid arguments'))
    }

    const url = buildUrl(clientId, redirectUri, optionalParams)

    return RandomHttpUserAgent.get()
      .then((userAgent) => this._loginCircuitBreaker.exec(url, userAgent))
  }
}

module.exports = FacebookLoginForRobots
