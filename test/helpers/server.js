'use strict'

const hexId = require('@tadashi/hex-id')
const request = require('supertest')
const toPort = require('hash-to-port')

function server(koa) {
	const hash = hexId()
	return request.agent(koa.listen(toPort(hash)))
}

module.exports = server
