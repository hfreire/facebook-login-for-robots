/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('Facebook Login', () => {
  let subject
  let nightmare
  let RandomHttpUserAgent

  before(() => {
    RandomHttpUserAgent = td.object('get')

    nightmare = td.object([ 'useragent', 'on', 'goto', 'type', 'click', 'wait', 'end', 'then' ])
  })

  afterEach(() => td.reset())

  describe('when performing oauth dialog with a website redirect', () => {
    const facebookUserId = 'my-facebook-user-id'
    const facebookAccessToken = 'my-facebook-access-token'
    const clientId = 'my-client-id'
    const redirectUri = 'http://my-redirect-uri'
    const url = `https://www.facebook.com/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}`
    const userAgent = 'my-user-agent'
    const email = 'my-email-address'
    const password = 'my-password'
    const facebook = { email, password }
    const options = { facebook }
    const requests = [
      [ 'xhr-complete', { path: '/pull' }, 'GET', `"u":${facebookUserId},"ms"` ]
    ]
    const redirects = [
      [ null, null, `${redirectUri}/#access_token=${facebookAccessToken}` ]
    ]

    beforeEach(() => {
      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)
      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.when(nightmare.useragent(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.on('page'), { ignoreExtraArgs: true }).thenDo((event, fn) => {
        _.forEach(requests, (request) => { fn(...request) })

        return nightmare
      })
      td.when(nightmare.on('did-get-redirect-request'), { ignoreExtraArgs: true }).thenDo((event, fn) => {
        _.forEach(redirects, (request) => fn(...request))

        return nightmare
      })
      td.when(nightmare.goto(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.type('input#email'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.type('input#pass'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.click(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.wait(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.end()).thenResolve()
      td.when(nightmare.then(), { ignoreExtraArgs: true }).thenDo((callback) => callback())
      td.replace('nightmare', () => nightmare)

      const FacebookLogin = require('../src/facebook-login')
      subject = new FacebookLogin(options)
    })

    it('should use user agent', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.useragent(userAgent), { times: 1 })
        })
    })

    it('should open facebook website', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.goto('https://facebook.com'), { times: 1 })
        })
    })

    it('should type e-mail address', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.type('input#email', email), { times: 1 })
        })
    })

    it('should type password', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.type('input#pass', password), { times: 1 })
        })
    })

    it('should click login button', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.click('#loginbutton input'), { times: 1 })
        })
    })

    it('should open oauth dialog url', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.goto(url), { times: 1 })
        })
    })

    it('should close nightmare', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.end(), { times: 1 })
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
    const facebookUserId = 'my-facebook-user-id'
    const facebookAccessToken = 'my-facebook-access-token'
    const clientId = 'my-client-id'
    const redirectUri = 'fbmy-redirect-uri'
    const url = `https://www.facebook.com/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}`
    const userAgent = 'my-user-agent'
    const email = 'my-email-address'
    const password = 'my-password'
    const facebook = { email, password }
    const options = { facebook }
    const requests = [
      [ 'xhr-complete', { path: '/pull' }, 'GET', `"u":${facebookUserId},"ms"` ],
      [ 'xhr-complete', 'oauth/confirm?dpr', 'GET', `access_token=${facebookAccessToken}` ]
    ]

    beforeEach(() => {
      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)
      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.when(nightmare.useragent(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.on('page'), { ignoreExtraArgs: true }).thenDo((event, fn) => {
        _.forEach(requests, (request) => { fn(...request) })

        return nightmare
      })
      td.when(nightmare.on('did-get-redirect-request'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.goto(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.type('input#email'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.type('input#pass'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.click(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.wait(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.end()).thenResolve()
      td.when(nightmare.then(), { ignoreExtraArgs: true }).thenDo((callback) => callback())
      td.replace('nightmare', () => nightmare)

      const FacebookLogin = require('../src/facebook-login')
      subject = new FacebookLogin(options)
    })

    it('should use user agent', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.useragent(userAgent), { times: 1 })
        })
    })

    it('should open facebook website', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.goto('https://facebook.com'), { times: 1 })
        })
    })

    it('should type e-mail address', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.type('input#email', email), { times: 1 })
        })
    })

    it('should type password', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.type('input#pass', password), { times: 1 })
        })
    })

    it('should click login button', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.click('#loginbutton input'), { times: 1 })
        })
    })

    it('should open oauth dialog url', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.goto(url), { times: 1 })
        })
    })

    it('should close nightmare', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .then(() => {
          td.verify(nightmare.end(), { times: 1 })
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

  describe.skip('when performing oauth dialog and unable to login', () => {
    const clientId = 'my-client-id'
    const redirectUri = 'fbmy-redirect-uri'
    const userAgent = 'my-user-agent'
    const email = 'my-email-address'
    const password = 'my-password'
    const facebook = { email, password }
    const options = { facebook }

    beforeEach(() => {
      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)
      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.when(nightmare.useragent(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.on('page'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.on('did-get-redirect-request'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.goto(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.type('input#email'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.type('input#pass'), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.click(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.wait(), { ignoreExtraArgs: true }).thenReturn(nightmare)
      td.when(nightmare.end()).thenResolve()
      td.when(nightmare.then(), { ignoreExtraArgs: true }).thenResolve()
      td.replace('nightmare', () => nightmare)

      const FacebookLogin = require('../src/facebook-login')
      subject = new FacebookLogin(options)
    })

    it('should reject with unable to login error', () => {
      return subject.oauthDialog(clientId, redirectUri)
        .catch((error) => {
          error.should.be.instanceOf(Error)
          error.message.should.be.equal('unable to login')
        })
    })
  })

  describe('when performing oauth dialog with invalid client id and redirect uri', () => {
    const clientId = undefined
    const redirectUri = undefined

    beforeEach(() => {
      td.replace('random-http-useragent', RandomHttpUserAgent)

      td.replace('nightmare', () => nightmare)

      const FacebookLogin = require('../src/facebook-login')
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
})
