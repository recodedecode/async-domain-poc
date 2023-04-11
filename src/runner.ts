import { Server } from '@hapi/hapi'
import shortid from 'shortid'
import { getDomains, getDomainHandler } from './domain'
import { CommandError, QueryError } from './errors'
import { execute } from './execute'
import { createReporter } from './reporter'


type Actionable = 'commands' | 'queries'

export const createExecutionRunner = (server: Server, actionType: Actionable) => request => async (action) => {
  // TODO
  // purify and clone the request object i.e. remove server etc.
  
  const { domain, handler } = getDomainHandler(getDomains(), action, actionType)
  const context = { ...domain.context, request, server }

  const id = shortid.generate()
  const logPrefix = `[${handler.type}:${id}]`
  const reporter = createReporter(server, logPrefix)

  try {
    reporter.start()
    const response = await execute(handler, request, context)
    reporter.finish()
    return response
  }
  catch (error) {
    reporter.error(error)

    const message = `Execution failed for domain '${action.domain}' handler '${action.type}'.`
    const errMessage = formatExecutionError(message, error)
    server.log('error', errMessage)

    if (error.name
      && error.data
      && error.time_thrown) {
      throw error
    }

    if (actionType === 'commands') {
      throw new CommandError()
    }
    else if (actionType === 'queries') {
      throw new QueryError()
    }

    throw error
  }
}

export const formatExecutionError = (message, error) => {

  let payload = message

  if (error.name !== error.message) {
    payload = `${payload} ${error.message}`
  }

  if (error.name) {
    payload = `${error.name}. ${payload}`
  }

  return payload
}
