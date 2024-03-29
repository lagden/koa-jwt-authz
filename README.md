# koa-jwt-authz

[![NPM version][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![Coverage Status][coveralls-img]][coveralls]

[npm-img]:         https://img.shields.io/npm/v/@tadashi/koa-jwt-authz.svg
[npm]:             https://www.npmjs.com/package/@tadashi/koa-jwt-authz
[ci-img]:          https://github.com/lagden/koa-jwt-authz/actions/workflows/nodejs.yml/badge.svg
[ci]:              https://github.com/lagden/koa-jwt-authz/actions/workflows/nodejs.yml
[coveralls-img]:   https://coveralls.io/repos/github/lagden/koa-jwt-authz/badge.svg?branch=master
[coveralls]:       https://coveralls.io/github/lagden/koa-jwt-authz?branch=master


Validate a JWTs `scope` to authorize access to an endpoint.

## Install

```
$ npm i -S @tadashi/koa-jwt-authz
```

> `koa >=2` is a peer dependency. Make sure it is installed in your project.


## Usage

Use together with [koa-jwt](https://github.com/koajs/jwt) to both validate a JWT and make sure it has the correct permissions to call an endpoint.

```js
import jwtAuthz from '@tadashi/koa-jwt-authz'
import jwt from 'koa-jwt'
import Koa from 'koa'
import Router from '@koa/router'

const app = new Koa()
const router = new Router()

router.get('/', ctx => {
  ctx.body = {home: 'free'}
})

router.get('/me',
  jwt({secret: 'shared_secret'}),
  jwtAuthz(['read:users']),
  ctx => {
    ctx.body = ctx.state.user
  }
)

app.use(router.middleware())
app.listen(process.env.PORT ?? 3000)
```

---

The JWT must have a `scope` claim and it must either be a string of space-separated permissions or an array of strings. For example:

```
# String: "write:users read:users"

# Array: ["write:users", "read:users"]
```


## API


#### jwtAuthz(expectedScopes \[, options\])

parameter      | type                 | required    | default               | description
-----------    | -------------------- | ----------- | -------------------   | ------------
expectedScopes | Array                | yes         | -                     | List of permissions
options        | Object               | no          | [see below](#options) | Options


#### options

parameter      | type                 | required    | default             | description
-----------    | -------------------- | ----------- | ------------------- | ------------
checkAllScopes | Boolean              | no          | false               | When true, all the expected scopes will be checked against the user's scopes
customScopeKey | String               | no          | scope               | The property name to check for the scope


## Author

[<img src="https://avatars.githubusercontent.com/u/130963?s=390" alt="Thiago Lagden" width="100">](https://github.com/lagden)


## License

MIT © [Thiago Lagden](https://github.com/lagden)
