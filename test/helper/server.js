import hexId from '@tadashi/hex-id'
import request from 'supertest'
import toPort from 'hash-to-port'

function server(koa) {
	const hash = hexId()
	return request.agent(koa.listen(toPort(hash)))
}

export default server
