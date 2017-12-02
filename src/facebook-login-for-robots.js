/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const BASE_URL = 'https://www.facebook.com/dialog/oauth'

const _ = require('lodash')
const Promise = require('bluebird')

const Perseverance = require('perseverance')

const puppeteer = require('puppeteer')

const RandomHttpUserAgent = require('random-http-useragent')

const querystring = require('querystring')

const buildUrl = function (clientId, redirectUri, options) {
  const params = _.assign({
    client_id: clientId,
    redirect_uri: redirectUri
  }, options)

  return `${BASE_URL}?${querystring.stringify(params, null, null, { encodeURIComponent: (s) => s })}`
}

const doLogin = function (url, redirectUri, userAgent) {
  return Promise.try(() => {
    if (!url || !userAgent) {
      throw new Error('invalid arguments')
    }
  })
    .then(() => {
      let facebookUserId
      let facebookAccessToken

      return puppeteer.launch(_.get(this._options, 'puppeteer'))
        .then((browser) => {
          return new Promise((resolve, reject) => {
            browser.newPage()
              .then((page) => {
                return page.setUserAgent(userAgent)
                  .then(() => page.setRequestInterception(true))
                  .then(() => page.on('request', (request) => {
                    const { url } = request

                    if (!facebookAccessToken && _.startsWith(redirectUri, 'http') && _.startsWith(url, redirectUri)) {
                      facebookAccessToken = _.get(url.match(/#access_token=(.*?)(&|$)/), '[1]')
                    }

                    request.continue()
                  }))
                  .then(() => page.on('response', (response) => {
                    if (!(_.includes(_.get(response, 'headers.content-type'), 'application/x-javascript') ||
                        _.includes(_.get(response, 'headers.content-type'), 'text/javascript'))) {
                      return
                    }

                    const { url } = response

                    if (!facebookUserId && _.includes(url, 'www.facebook.com/ajax/haste-response')) {
                      facebookUserId = _.get(url.match(/__user=([0-9]+)/), '[1]')

                      return
                    }

                    if (!facebookAccessToken && _.includes(url, 'oauth/confirm?dpr')) {
                      return response.text()
                        .then((text) => {
                          facebookAccessToken = _.get(text.match(/access_token=(.*?)(&|$)/), '[1]')
                        })
                    }
                  }))
                  .then(() => page.goto('https://facebook.com'))
                  .then(() => page.type('input#email', _.get(this._options, 'facebook.email')))
                  .then(() => page.type('input#pass', _.get(this._options, 'facebook.password')))
                  .then(() => page.click('#loginbutton input'))
                  .then(() => page.waitForNavigation())
                  .then(() => page.goto(url))
                  .then(() => {
                    if (_.startsWith(redirectUri, 'fb')) {
                      return page.waitForSelector('button._42ft._4jy0.layerConfirm._1flv._51_n.autofocus.uiOverlayButton._4jy5._4jy1.selected._51sy')
                        .then(() => page.click('button._42ft._4jy0.layerConfirm._1flv._51_n.autofocus.uiOverlayButton._4jy5._4jy1.selected._51sy'))
                    }
                  })
                  .then(() => {
                    return page.waitForNavigation({ timeout: 2000, waitUntil: 'networkidle2' })
                      .catch(() => {})
                  })
              })
              .then(() => {
                if (!facebookAccessToken || !facebookUserId) {
                  throw new Error('unable to login')
                }

                resolve({ facebookAccessToken, facebookUserId })
              })
              .catch(reject)
          })
            .finally(() => browser.close())
        })
    })
}

const defaultOptions = {
  facebook: {},
  puppeteer: {
    args: [ '--no-sandbox' ]
  },
  perseverance: {
    retry: { max_tries: 3, interval: 15000, timeout: 80000, throw_original: true },
    breaker: { timeout: 120000, threshold: 80, circuitDuration: 3 * 60 * 60 * 1000 },
    rate: {
      requests: 1,
      period: 1000
    }
  },
  'random-http-useragent': {}
}

class FacebookLoginForRobots {
  constructor (options = {}) {
    this._options = _.defaultsDeep({}, options, defaultOptions)

    this._perseverance = new Perseverance(_.get(this._options, 'perseverance'))

    RandomHttpUserAgent.configure(_.get(this._options, 'random-http-useragent'))
  }

  get circuitBreaker () {
    return this._perseverance.circuitBreaker
  }

  oauthDialog (clientId, redirectUri, options = {}) {
    return Promise.try(() => {
      if (!clientId || !redirectUri) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => {
        const url = buildUrl(clientId, redirectUri, options)

        return RandomHttpUserAgent.get()
          .then((userAgent) => this._perseverance.exec(() => doLogin.bind(this)(url, redirectUri, userAgent)))
      })
  }
}

module.exports = FacebookLoginForRobots
