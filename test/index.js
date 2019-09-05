'use strict'

import test from 'ava'
import Koa from 'koa'
import jwt from 'koa-jwt'
import jwtAuthz from '../lib'
import server from './helpers/server'

const tokenRW = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RoaWFnb2xhZ2Rlbi5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTYzMjUwMWY0NjhmMGYxNzU2ZjRjYWIwIiwiYXVkIjoiUDdiYUJ0U3NyZkJYT2NwOWx5bDFGRGVYdGZhSlM0clYiLCJleHAiOjI1Njg5NjQ5MjYsImlhdCI6MTU0OTk5ODkyNiwic2NvcGUiOlsid3JpdGU6dXNlcnMiLCJyZWFkOnVzZXJzIl19.CaKBzyRfHf_Ffmpm0WgS2w5p_8rM2CFDN1rYnh8E7WE'
const tokenR = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RoaWFnb2xhZ2Rlbi5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTYzMjUwMWY0NjhmMGYxNzU2ZjRjYWIwIiwiYXVkIjoiUDdiYUJ0U3NyZkJYT2NwOWx5bDFGRGVYdGZhSlM0clYiLCJleHAiOjI1Njg5NjQ5MjYsImlhdCI6MTU0OTk5ODkyNiwic2NvcGUiOlsicmVhZDp1c2VycyJdfQ.YoAbB257P3l4MHn7Md92-ohM4DRdXYdpQYdTHjG2pgQ'
const tokenAnother = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RoaWFnb2xhZ2Rlbi5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTYzMjUwMWY0NjhmMGYxNzU2ZjRjYWIwIiwiYXVkIjoiUDdiYUJ0U3NyZkJYT2NwOWx5bDFGRGVYdGZhSlM0clYiLCJleHAiOjI1Njg5NjQ5MjYsImlhdCI6MTU0OTk5ODkyNiwiYW5vdGhlclNjb3BlIjpbInJlYWQ6dXNlcnMiXX0.YGzon5EnspWSjhPMKc_eaIUw5rHfeRlTPHNGALlyIdg'

test('200', async t => {
	const koa = new Koa()
	koa
		.use(jwt({secret: 'shared_secret'}))
		.use(jwtAuthz(['read:users']))
		.use(ctx => {
			ctx.body = {ok: true}
		})

	const app = server(koa)
	const res = await app
		.get('/')
		.set({
			authorization: `Bearer ${tokenR}`
		})
	const {ok} = res.body

	t.is(res.status, 200)
	t.true(ok)
})

test('throws missing scope', t => {
	const error = t.throws(() => {
		jwtAuthz()
	}, TypeError)

	t.is(error.message, 'Parameter expectedScopes must be an array of strings representing the scopes for the endpoint(s)')
})

test('401', async t => {
	const koa = new Koa()
	koa
		.use(jwt({secret: 'shared_secret'}))
		.use(jwtAuthz(['write:users']))
		.use(ctx => {
			ctx.body = {ok: true}
		})

	const app = server(koa)
	const res = await app
		.get('/')
		.set({
			authorization: `Bearer ${tokenR}`
		})

	t.is(res.status, 401)
	t.is(res.text, 'User not allowed')
	t.is(res.headers['www-authenticate'], 'Bearer scope="write:users", error="User not allowed"')
})

test('options - scopeKey', async t => {
	const koa = new Koa()
	koa
		.use(jwt({secret: 'shared_secret'}))
		.use(jwtAuthz(['read:users'], {customScopeKey: 'anotherScope'}))
		.use(ctx => {
			ctx.body = {ok: true}
		})

	const app = server(koa)
	const res = await app
		.get('/')
		.set({
			authorization: `Bearer ${tokenAnother}`
		})
	const {ok} = res.body

	t.is(res.status, 200)
	t.true(ok)
})

test('options - checkAllScopes - 401', async t => {
	const koa = new Koa()
	koa
		.use(jwt({secret: 'shared_secret'}))
		.use(jwtAuthz(['read:users', 'write:users', 'exec:users'], {checkAllScopes: true}))
		.use(ctx => {
			ctx.body = {ok: true}
		})

	const app = server(koa)
	const res = await app
		.get('/')
		.set({
			authorization: `Bearer ${tokenRW}`
		})

	t.is(res.status, 401)
})

test('options - checkAllScopes - 200', async t => {
	const koa = new Koa()
	koa
		.use(jwt({secret: 'shared_secret'}))
		.use(jwtAuthz(['read:users', 'write:users'], {checkAllScopes: true}))
		.use(ctx => {
			ctx.body = {ok: true}
		})

	const app = server(koa)
	const res = await app
		.get('/')
		.set({
			authorization: `Bearer ${tokenRW}`
		})

	t.is(res.status, 200)
})
