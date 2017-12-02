/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

/* eslint-disable promise/no-native */

describe('Facebook Login for robots', () => {
  let subject
  let Perseverance
  let puppeteer
  let browser
  let page
  let RandomHttpUserAgent

  before(() => {
    Perseverance = td.constructor([ 'exec', 'circuitBreaker' ])

    puppeteer = td.object([ 'launch' ])

    browser = td.object([ 'newPage', 'close' ])

    page = td.object([ 'setUserAgent', 'setRequestInterception', 'on', 'goto', 'type', 'click', 'waitForNavigation', 'waitForSelector' ])

    RandomHttpUserAgent = td.object('get')
  })

  afterEach(() => td.reset())

  describe('when performing oauth dialog with a website redirect', () => {
    const facebookUserId = '1'
    const facebookAccessToken = 'my-facebook-access-token'
    const clientId = 'my-client-id'
    const redirectUri = 'http://my-redirect-uri'
    const url = `https://www.facebook.com/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}`
    const userAgent = 'my-user-agent'
    const email = 'my-email-address'
    const password = 'my-password'
    const facebook = { email, password }
    const options = { facebook }
    const request = { url: `${redirectUri}#access_token=${facebookAccessToken}&` }
    const responses = [ {
      url: `https://www.facebook.com/ajax/haste-response?__user=${facebookUserId}`,
      headers: { 'content-type': 'application/x-javascript' }
    }, {
      url: 'my-response-url'
    } ]

    before(() => {
      request.continue = td.function()
    })

    beforeEach(() => {
      td.when(request.continue()).thenResolve()

      td.when(Perseverance.prototype.exec(), { ignoreExtraArgs: true }).thenDo((callback) => callback())
      td.replace('perseverance', Perseverance)

      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)
      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.when(puppeteer.launch(), { ignoreExtraArgs: true }).thenResolve(browser)
      td.when(browser.newPage()).thenResolve(page)
      td.when(browser.close()).thenResolve()
      td.when(page.setUserAgent(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.on('request', td.callback(request))).thenResolve()
      td.when(page.on('response'), { ignoreExtraArgs: true }).thenDo((eventName, callback) => {
        _.forEach(responses, (response) => callback(response))

        return Promise.resolve()
      })
      td.when(page.goto(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.type(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.click(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.waitForNavigation(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.waitForSelector(), { ignoreExtraArgs: true }).thenResolve()
      td.replace('puppeteer', puppeteer)

      const FacebookLogin = require('../src/facebook-login-for-robots')
      subject = new FacebookLogin(options)
    })

    it('should use user agent', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(page.setUserAgent(userAgent), { times: 1 })
        })
    })

    it('should open facebook website', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(page.goto('https://facebook.com'), { times: 1 })
        })
    })

    it('should type e-mail address', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(page.type('input#email', email), { times: 1 })
        })
    })

    it('should type password', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(page.type('input#pass', password), { times: 1 })
        })
    })

    it('should click login button', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(page.click('#loginbutton input'), { times: 1 })
        })
    })

    it('should open oauth dialog url', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(page.goto(url), { times: 1 })
        })
    })

    it('should close browser', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(browser.close(), { times: 1 })
        })
    })

    it('should resolve with facebook access token and user id', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then((result) => {
          result.should.have.property('facebookAccessToken', facebookAccessToken)
          result.should.have.property('facebookUserId', facebookUserId)
        })
    })
  })

  describe('when performing oauth dialog with a facebook app redirect', () => {
    const facebookUserId = '1'
    const facebookAccessToken = 'my-facebook-access-token'
    const clientId = 'my-client-id'
    const redirectUri = `fb${clientId}`
    const userAgent = 'my-user-agent'
    const email = 'my-email-address'
    const password = 'my-password'
    const facebook = { email, password }
    const options = { facebook }
    const responses = [
      {
        url: `https://www.facebook.com/ajax/haste-response?__user=${facebookUserId}`,
        headers: { 'content-type': 'application/x-javascript' }
      },
      {
        url: `https://www.facebook.com/v2.6/dialog/oauth/confirm?dpr=1`,
        headers: { 'content-type': 'application/x-javascript' }
      }
    ]
    const text = `access_token=${facebookAccessToken}`

    before(() => {
      responses[ 1 ].text = td.function()
    })

    beforeEach(() => {
      td.when(responses[ 1 ].text()).thenResolve(text)

      td.when(Perseverance.prototype.exec(), { ignoreExtraArgs: true }).thenDo((callback) => callback())
      td.replace('perseverance', Perseverance)

      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)
      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.when(puppeteer.launch(), { ignoreExtraArgs: true }).thenResolve(browser)
      td.when(browser.newPage()).thenResolve(page)
      td.when(browser.close()).thenResolve()
      td.when(page.setUserAgent(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.on('request'), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.on('response'), { ignoreExtraArgs: true }).thenDo((eventName, callback) => {
        _.forEach(responses, (response) => callback(response))

        return Promise.resolve()
      })
      td.when(page.goto(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.type(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.click(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.waitForNavigation(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.waitForSelector(), { ignoreExtraArgs: true }).thenResolve()
      td.replace('puppeteer', puppeteer)

      const FacebookLogin = require('../src/facebook-login-for-robots')
      subject = new FacebookLogin(options)
    })

    it('should click facebook app confirmation button', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(page.click('button._42ft._4jy0.layerConfirm._1flv._51_n.autofocus.uiOverlayButton._4jy5._4jy1.selected._51sy'), { times: 1 })
        })
    })
  })

  describe('when performing oauth dialog with a facebook app and is unable to log in', () => {
    const facebookAccessToken = 'my-facebook-access-token'
    const clientId = 'my-client-id'
    const redirectUri = `fb${clientId}`
    const userAgent = 'my-user-agent'
    const email = 'my-email-address'
    const password = 'my-password'
    const facebook = { email, password }
    const options = { facebook }
    const responses = [
      {
        url: `https://www.facebook.com/v2.6/dialog/oauth/confirm?dpr=1`,
        headers: { 'content-type': 'application/x-javascript' }
      }
    ]
    const text = `access_token=${facebookAccessToken}`

    before(() => {
      responses[ 0 ].text = td.function()
    })

    beforeEach(() => {
      td.when(responses[ 0 ].text()).thenResolve(text)

      td.when(Perseverance.prototype.exec(), { ignoreExtraArgs: true }).thenDo((callback) => callback())
      td.replace('perseverance', Perseverance)

      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)
      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.when(puppeteer.launch(), { ignoreExtraArgs: true }).thenResolve(browser)
      td.when(browser.newPage()).thenResolve(page)
      td.when(browser.close()).thenResolve()
      td.when(page.setUserAgent(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.on('request'), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.on('response'), { ignoreExtraArgs: true }).thenDo((eventName, callback) => {
        _.forEach(responses, (response) => callback(response))

        return Promise.resolve()
      })
      td.when(page.goto(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.type(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.click(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.waitForNavigation(), { ignoreExtraArgs: true }).thenResolve()
      td.when(page.waitForSelector(), { ignoreExtraArgs: true }).thenResolve()
      td.replace('puppeteer', puppeteer)

      const FacebookLogin = require('../src/facebook-login-for-robots')
      subject = new FacebookLogin(options)
    })

    it('should reject with error message unable to login', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.should.have.property('message', 'unable to login')
        })
    })
  })

  describe('when performing oauth dialog with invalid client id and redirect uri', () => {
    const clientId = undefined
    const redirectUri = undefined

    beforeEach(() => {
      td.when(Perseverance.prototype.exec(), { ignoreExtraArgs: true }).thenDo((callback) => callback())
      td.replace('perseverance', Perseverance)

      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.replace('puppeteer', puppeteer)

      const FacebookLogin = require('../src/facebook-login-for-robots')
      subject = new FacebookLogin()
    })

    it('should reject with invalid arguments', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('invalid arguments')
        })
    })
  })

  describe('when getting circuit breaker', () => {
    beforeEach(() => {
      td.replace('perseverance', Perseverance)

      const FacebookLogin = require('../src/facebook-login-for-robots')
      subject = new FacebookLogin()
      subject.circuitBreaker()
    })

    it('should return a brakes instance', () => {
      td.verify(Perseverance.prototype.circuitBreaker(), { times: 1 })
    })
  })
})
