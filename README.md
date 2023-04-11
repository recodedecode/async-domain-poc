> ***IMPORTANT:** This repo represents an old idea, like a years and years ago old idea, where I was toying around in relation to creating isolated domains within a larger application using nodejs [async hooks](https://nodejs.org/api/async_hooks.html). Async hooks was and is an experimental feature you probably shouldn't use - take a look at [async local storage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) as a possibly better alternative.*
>
> *Oh and I pulled this out from a larger lerna based repo so yeah... I'd need to add a few things for it to "just work" but you don't want that, this is after all just a bit of fun reading now.*
>
> *So, **don't use this** is what I'm saying - it was just me playing around.*



![Domain](domain.png "Domain")



<p align="center">A module for <strong>creating and managing domains</strong>.<p>
<p align="center">
  <strong>Domain</strong> enables the creation of <i>black box microservices</i> that provide a bounded context either within a larger application or as an independent service.
  It is intended to be used for medium-to-complex business domains that require some level of sophistication, historicity, isolation and scaling.
</p>
<p align="center"><i>The icon 'spiral' is created by Alvaro Cabrera from <a href="https://thenounproject.com/search/?q=1822912&i=1822912" target="blank">the Noun Project</a> and then modified.</i></p>



# Overview

The **domain** package supports the creation of self-contained domains similar to those found in the Domain Driven Design (DDD) approach. It lends itself nicely to patterns such as Command Query Responsibility Segregation (CQRS) and works well with GraphQL mutations and queries. Used in conjunction with *Event Sourcing* it can be used to create ioslated black box microservices that are idempotent and event driven. This means it's easy to run these "isolated" within a larger monolith and in turn makes transitioning a domain to a microservice(s) (should you so dare) relatively straight forward.

## Contents

* [Getting Started](#getting-started)
* [API](#api)

# Doing it different

As a quick background, the idea here was inspired by React hooks (their earliest version) where you pull in and build up functions with state. I liked how composable, testable and readable it all was and wanted to see if you could do something similar on the backend and [async hooks](https://nodejs.org/api/async_hooks.html) looked like it might work. In short async hooks allow you to create a context that can be shared across promises. So as you will see below, you can compose "hook" like methods that can be used to pull in the server request, database connections or other services you might defined for the domain. Easy to mock out for testing too.

Things move along and this is after all an experiment from years and years ago. If this concept interests you probably best to look at [async local storage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) and the docs there instead of async hooks.

# Getting Started

A typical domain is composed of actions, commands, queries and a shared context. These work together to produce a domain that can validate, persist, dispatch and playback client commands and queries.



### Quick Domain Setup

Domains are created using the `createDomain` method and accept a name, a list of commands, queries and a shared context.



```javascript
import { createDomain } from '@makker/domain'

createDomain({
  name: 'teams',
  commands: [createTeam],
  queries: [getTeams],
  context: {},
})
```



Domain commands and queries can then be invoked from the request or server object.



```javascript
// RESTful
server.route({
  method: 'POST',
  path: '/teams',
  handler: async (request, h) => {
    const { actions, execute, payload } = request
    const { createTeam } = actions.teams
    return await execute(createTeam(payload))
  }
}, {
  method: 'GET',
  path: '/team/{teamId}',
  handler: async (request, h) => {
    const { actions, fetch, payload } = request
    const { getTeam } = actions.teams
    const { teamId } = request.params
    return await fetch(getTeam(teamId))
  }
})

// GraphQL
const resolverMap = {
  Mutation: {
    createTeam(obj, args, context, info) {
      const { actions, execute, payload } = context
      const { createTeam } = actions.teams
      return await execute(createTeam(args))
    },
  },
  Query: {
    getTeam(obj, args, context, info) {
      const { actions, fetch, payload } = context
      const { getTeam } = actions.teams
      return await fetch(getTeam(args))
    },
  },
}
```



### Action

An *action* is a set of instructions with related data that is used by an command handler to modify internal state and dispatch subsequent events. An action must be serializable, typically as json as it is often transmitted through a message router, event or http request.

An action has the following signature:

* `auth` - an (optional) boolean value used to pre-authorise the action before it is dispatched. If present and the request has no authorisation then an authorisation error will be returned to the client through the API.
* `domain` - a (required) string value that matches the domain service name.

* `type` - a (required) string value that corresponds to a command or query within the domain.
* `payload` - an (optional) serializable value, typically an object, containing values to be used with the action.
* `schema` - an (optional) [Joi](https://www.npmjs.com/package/@hapi/joi) schema object used to pre-validate the action before it is dispatched. If validation fails the action will not be dispatched and a validation error will be returned to the client through the API.



```javascript
const addToTeam = {
  domain: 'teams'
  type: 'teams_create_team',
  auth: true,
  schema: Joi.object().keys({...}),
  payload: {
    name: 'foals',
  },
}
```



### Action Creators

An *action creator* is a function that returns an *action*. You will typically not need to create actions or action creators as they are generated automatically based upon the commands and queries provided with the domain. They are explained here to help with understanding the workflow of a domain and how it interacts with routing handlers.



```javascript
const addToTeam = (name) => ({
  domain: 'teams'
  type: 'teams_create_team',
  auth: true,
  schema: Joi.object().keys({...}),
  payload: {
    name,
  },
})
```



### Dispatch, Query or Execute Actions

Actions invoke their corresponding command and query handlers by either being *dispatched*, *queried* or *executed*. To dispatch (query or execute) an *action*, pass the result of the *action creator* (or action) to the *dispatch*, *fetch* or *execute* method available from the *context* or *request* object.

Each method has a specific use case relevant for either commands or queries:

* `dispatch` - used to route the action to it's corresponding command handler over a message router.
* `execute` - used to immediately invoke the corresponding command handler.
* `fetch` - used to immediately invoke the corresponding query handler.

Each method accepts an action and returns a promise that resolves the result of the processed command or query. If an action is dispatched then no result is resolved.

#### Dispatch Example

Below is an example using a GraphQL resolver. The second paramater contains the user input from a mutation and the thrid paramater contains the context object that includes the domain, dispatcher and auto generated actions.

```javascript
createTeam: async (_, { input }, { actions, dispatch }) => {
  const { createTeam } = actions.teams
  return await dispatch(createTeam(input))
},
```



### Action Handler

The *action handler* (a generic name for both command and query handlers) processes corresponding *actions* of the same `type`. In its simplist form it is a named async function invoked with a single paramater that is the payload.

```javascript
const createTeam = async (payload) => {
  console.log(JSON.stringify(payload, null, 2))
}
```

It can also be an object with pre and post handler methods and include checks for authorisation and payload validation.

```javascript
const createTeam = {
  name: 'createTeam',
  auth: true,
  schema: Joi.object().keys({...}),
  before: async (payload) => {...},
  handler: async (payload) => {...},
  after: async (payload) => {...},
}
```

Each method is passed the previous methods returned result enabling transformation of the payload as required. If a schema is provided the payload is passed as validated.

### Hooks

*Hooks* are composable functions used to provide additional functionality to *action handlers*. *Hooks* make use of the experimental Nodejs feature *async_hooks*. As such *hooks* can be provided a shared context that include the request object and payload or additional service providers such as Redis or an Event Store.

**IMPORTANT:** Hooks make use of the experimental Nodejs feature *async_hooks*. These are experimental and should not be used for production applications - this is all experimental and conceptual as well as the methods propossed below.

There are several *hooks* provided with the *domain* package to help things such as authorisation and validation.

```javascript
import { useAuth, useValidation } from '@makker/domain'

const createTeam = async () {
  const { userId } = await useAuth()
  const payload = await useValidation(schema)
  // ...
}
```



#### Custom hooks

As well as those already provided, custom *hooks* can easily be created to provide additional functionality for action handlers. Hooks can be composed to access the shared context.

```javascript
import { useContext } from '@makker/domain'

const useRedis = async () {
  const { providers } = await useContext()
  return providers.redis
}

const createTeam = async () {
  const redis = await useRedis()
}
```



# API

* [createDomain](#createdomain)
* [removeDomain](#removedomain)
* [request](#request)
  * [actions](#request.actions)
  * [dispatch](#request.dispatch)
  * [execute](#request.execute)
  * [fetch](#request.fetch)
* [useAcl](#useacl)
* [useAuth](#useauth)
* [useContext](#usecontext)
* [useDispatcher](#usedispatcher)
* [useProvider](#useprovider)
* [useRequest](#userequest)
* [useServer](#useserver)
* [useValidator](#usevalidator)



### `createDomain(options)`

Creates and returns a `domain` instance where:

* `name` - a required string that uniquely identifies the domain.
* `commands` - an conditional array of commands (mutations) specific to this domain.
* `queries` - a conditional array of queries specific to this domain.
* `context` - an optional object to be shared with commands and queries during invocation.
* `providers` - an optional object containing additional services i.e. `redis`, `eventstore`, `mysql`.



```javascript
const domain = await createDomain({
  'teams',
  commands: [createTeam]
})

// console.log(domain.actions)
```



### `removeDomain(name)`

Removes a domain instance and associated actions.



```javascript
await removeDomain('teams')
```



### `request`

The [Hapi request object](https://hapi.dev/api/?v=18.3.2#request) created internally for each request that is decorated with specific *domain* methods such as:



### `request.actions`

An object whose keys match instantiated domain names and whose children are domain action creators.



```javascript
const { createTeam } = request.actions.teams
```



### `request.dispatch(action)`

An async function that dispatches a serialisable domain action via a messaging router - typically a queue or message bus. It is used for commands only which are immediately processed when received off the queue. Dispatch uses [channel](../channel) internally - see the [channel docs](../channel) for more details. Use this for appropriate GraphQL mutations.



```javascript
const { dispatch, actions } = request
const createTeam = actions.teams
await dispatch(createTeam('foals'))
```



### `request.execute(action)`

An async function that immediately executes an action and its associated command handler. It returns the response from the action handler. Use this for appropriate GraphQL mutations.



```javascript
const { execute, actions } = request
const createTeam = actions.teams
await execute(createTeam('foals'))
```



### `request.fetch(action)`

An async function that immediately executes a domain query handler and returns the response. Use this for GraphQL queries.



```javascript
const { fetch, actions } = request
const getTeam = actions.teams
await fetch(getTeam('foals'))
```



*NB:* It is called *fetch* as *query* is a keyword already used on the *request* object - see [Hapi docs here](https://hapi.dev/api/?v=18.3.2#request.query).



### `useAcl()`

A convenience method for returning access to the [ACL](../acl) object. See the [ACL docs](../acl) for more information.



```javascript
const createTeam = async () {
  const acl = await useAcl()
  // ...
}
```

 

### `useAuth()`

An async function that ensures the user is authenticated and/or authorised and returns an object containing the `userId` and `acl` library. It can be invoked in three ways:



#### 1. `useAuth()`

When invoked without any arguments it will simply verify the user ensuring the request is authenticated. This is perfomed for every subsequent invocation of `useAuth()` also. If this check fails it will throw an authentication error.



```javascript
import { useAuth } from '@makker/domain'

const createTeam = async (payload) {
  const { userId } = await useAuth()
  // ...
}
```



#### 2. `useAuth(roles)`

When invoked with single role(s) argument it will firstly verify the user is authenticated and then check that the user has the required role. If either check fails it will throw an authentication or authorisation error.



Arguments:

* `roles` - a string or array of string values representing user roles.



Example:

```javascript
import { useAuth } from '@makker/domain'

const createTeam = async (payload) {
  const { userId } = await useAuth(['member', 'admin'])
  // ...
}
```



#### 3. `useAuth(resource, scopes)`

When invoked with two arguments, a resource id and scopes (or permissions), it will first verify the user is authenticated and then check that the user has both access and the required permission scope to the specified resource.



Arguments:

* `resource` - a string value representing the resource to ask permissions for.
* `scopes` - a string or array of strings of permission scopes.



Example:

```javascript
import { useAuth } from '@makker/domain'

const editTeam = async ({ id, ...changes }) {
  const { userId } = await useAuth(id, 'edit')
  // ...
}
```



### `useContext()`

An async function that returns the entire context object for the given action handler. This object contains references to the request and domain specific providers.



```javascript
import { useContext } from '@makker/domain'

const createTeam = async () {
  const { payload, providers, request, server } = await useContext()
  // ...
}
```



### `useDispatcher()`

An async function that returns the [channel](../channel) dispatcher for routing messages both internally and externally. See the [channel docs](../channel) for more on how the dispatcher can be used.



```javascript
import { useDispatcher } from '@makker/domain'

const createTeam = async () {
  const dispatch = await useDispatcher()
  dispatch('yolo', 'be a contender')
  // ...
}
```



### `useProvider()`

An async function that returns domain specific providers.



```javascript
import { useProvider } from '@makker/domain'

const createTeam = async () {
  const { eventstore, redis } = await useProvider()
  // ...
}
```



### `useRequest()`

An async function that returns the request object.



```javascript
import { useRequest } from '@makker/domain'

const createTeam = async () {
  const { payload } = await useRequest()
  // ...
}
```



### `useServer()`

An async function that returns the server object.



```javascript
import { useServer } from '@makker/domain'

const createTeam = async () {
  const server = await useServer()
  // ...
}
```



### `useValidator(schema)`

An async function that validates the request payload against a [Joi](https://www.npmjs.com/package/@hapi/joi) schema and returns the validated payload. If validation fails it throws a validation error (this is returned to the user if applicable) and cancels the action handler. See the  [Joi docs](https://www.npmjs.com/package/@hapi/joi) for information on schemas and validation.



```javascript
import joi from '@hapi/joi'
import { useValidator } from '@makker/domain'

const schema = joi.object().keys({...})

const createTeam = async () {
  const payload = await useValidator(schema)
  // ...
}
```

