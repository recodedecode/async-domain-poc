import joi from '@hapi/joi'
import camelCase from 'camelcase'
import snakeCase from 'snake-case'
import { createCommand } from './command'
import { domainSchema } from './validators'


const domains = new Map()

export const getDomains = () =>
  domains

export const getDomainActions = () => {
  const domainActions = {}
  domains.forEach((domain, domainName) => {
    domainActions[domainName] = domain.actions || {}
  })
  return domainActions
}

export const removeDomain = (name) => {
  domains.delete(name)
}

export const createDomain = async (domainOptions) => {

  // TODO
  // validators
  // providers (services) 

  const {
    error: optionsError, value: domain
  } = joi.validate(domainOptions, domainSchema)

  if (optionsError) {
    throw optionsError
  }

  if (domains.has(domain.name)) {
    throw Error(`A domain named ${domain.name} already exists - cannot create domain.`)
  }

  const commandables = domain.commands.map(createCommand)
  const queryables = domain.queries.map(createCommand)
  const handlers = createHandlers([...commandables, ...queryables], domain.name)
  const actions = createActionMap(handlers, domain.name)
  const commands = createHandlerMap(commandables, domain.name)
  const queries = createHandlerMap(queryables, domain.name)

  const service = {
    context: {},
    ...domain,
    actions,
    commands,
    queries,
  }

  domains.set(domain.name, service)
  return service
}

const createHandlers = (handlers, domainName) => {
  const all = handlers.map(({ name }) => name)
  const duplicates = all.filter((name, index) =>
    all.indexOf(name) !== index)

  if (duplicates.length) {
    const names = duplicates.join(', ')
    let message = `Duplicate command and queries found ${names}`
    message += ` - cannot create domain ${domainName}`
    throw new Error(message)
  }

  return handlers
}

const createActionMap = (handlers, domainName) =>
  handlers.reduce((acc, { auth, name, schema }) => {
    acc[camelCase(name)] = payload => ({
      auth,
      domain: domainName,
      type: snakeCase(`${domainName}_${name}`),
      payload,
      schema,
    })
    return acc
  }, {})

const createHandlerMap = (handlers = [], domainName) =>
  handlers.reduce((acc, curr) => {
    const type = snakeCase(`${domainName}_${curr.name}`)
    acc[type] = {
      ...curr,
      type,
    }
    return acc
  }, {})

export const getDomainHandler = (domains, action, type) => {
  const domain = domains.get(action.domain)
  const handler = domain[type][action.type]

  if ( ! handler) {
    throw Error(`Cannot find '${type}' matching action type '${action.type}'.`)
  }

  return { domain, handler }
}
