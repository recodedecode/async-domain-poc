import { createContext } from './context'
import { Command, Expectable } from './command'


type Request = {
  [key: string]: any,
}

type Context = {
  [key: string]: any,
}

export const execute = async (command: Command, request: Request = {}, context: Context = {}) =>
  createContext(async () => {

    try {
      let payload = request.payload
      let response

      for (const executable of command.executables) {
        const result = await executable.handler(payload)

        if ( ! meetsResponseTypeExpectations(result, executable.expects)) {
          throw Error(`Command execution failed`)
        }

        if (executable.returnable) {
          response = result
        }

        if (executable.transferable) {
          payload = result || payload
        }
      }

      return response
    }
    catch (err) {
      // console.log('[Error (command runner)]', err.message)
      throw err
    }
  }, { ...context, request })

const meetsResponseTypeExpectations = (value: any, expects: Expectable = {}) => {
  if (expects.type && !expects.type.includes(typeof value)) {
    return false
  }
  if (expects.value && expects.value !== value) {
    return false
  }
  return true
}

export const commandMethods = [
  {
    name: 'validator',
    transferable: true,
  }, {
    name: 'auth',
    transferable: false,
    expects: {
      type: 'boolean',
      value: true,
    },
  }, {
    name: 'before',
    transferable: true,
  }, {
    name: 'handler',
    returnable: true,
    transferable: true,
  }, {
    name: 'after',
    transferable: true,
  }
]
