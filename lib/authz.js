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
 * Helper for scopes
 *
 * @param {string | string[]} userScopeKey - permissions
 * @returns {Set | boolean}
 *
 * @api private
 */
function _userScopes(userScopeKey) {
	if (typeof userScopeKey === 'string') {
		return new Set(userScopeKey.split(' '))
	}

	if (Array.isArray(userScopeKey)) {
		return new Set(userScopeKey)
	}

	return false
}

/**
 * JWT Authz middleware.
 *
 * @param {string[]} expectedScopes - List of permissions
 * @param {any} [options={}]
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

		const {user} = ctx.state

		if (user === undefined) {
			_error(ctx, expectedScopes, 'Missing user data')
		}

		const userScopes = _userScopes(user[scopeKey])
		if (userScopes === false) {
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
