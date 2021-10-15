/**
 * Helper
 *
 * @param {Object} ctx           - Koa context
 * @param {Array} expectedScopes - List of permissions
 * @param {string} errorMessage  - Error message
 *
 * @api private
 */
function _error(ctx, expectedScopes, errorMessage) {
	ctx.throw(401, 'Unauthorized', {
		statusCode: 401,
		error: 'Unauthorized',
		message: errorMessage,
		headers: {
			'WWW-Authenticate': `Bearer scope="${expectedScopes.join(' ')}", error="${errorMessage}"`,
		},
	})
}

/**
 * JWT Authz middleware.
 *
 * @param {Array} expectedScopes - List of permissions
 * @param {Object} [options={}]
 *  - {boolean} checkAllScopes   - default is false
 *  - {String} customScopeKey    - default is scope
 * @returns {function}           - next function
 * @api public
 */
function jwtAuthz(expectedScopes, options = {}) {
	const {
		checkAllScopes = false,
		customScopeKey: scopeKey = 'scope',
	} = options

	if (Array.isArray(expectedScopes) === false) {
		throw new TypeError('Parameter expectedScopes must be an array of strings representing the scopes for the endpoint(s)')
	}

	return async (ctx, next) => {
		if (expectedScopes.length === 0) {
			await next()
			return
		}

		let userScopes
		const {user} = ctx.state

		if (user === undefined) {
			_error(ctx, expectedScopes, 'Missing user data')
		}

		if (typeof user[scopeKey] === 'string') {
			userScopes = new Set(user[scopeKey].split(' '))
		} else if (Array.isArray(user[scopeKey])) {
			userScopes = new Set(user[scopeKey])
		} else {
			_error(ctx, expectedScopes, 'Insufficient scope')
		}

		const methods = ['some', 'every']
		const position = checkAllScopes ? 1 : 0
		const allowed = expectedScopes[methods[position]](scope => userScopes.has(scope))

		if (allowed) {
			await next()
			return
		}

		_error(ctx, expectedScopes, 'User not allowed')
	}
}

export default jwtAuthz
