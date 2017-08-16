/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('Module', () => {
  let subject
  let FacebookLoginForRobots

  before(() => {
    FacebookLoginForRobots = td.constructor()
  })

  afterEach(() => td.reset())

  describe('when loading', () => {
    beforeEach(() => {
      td.replace('../src/facebook-login-for-robots', FacebookLoginForRobots)

      subject = require('../src/index')
    })

    it('should export facebook login for robots', () => {
      subject.should.be.equal(FacebookLoginForRobots)
    })
  })
})
