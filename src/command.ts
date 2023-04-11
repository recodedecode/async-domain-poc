import { commandMethods } from './execute'


type ActionHandler = (payload?: object) => Promise<any>
type ActionHandlers = Array<ActionHandler>

type Commandable = {
  name: string,
  auth?: boolean | Function,
  validator?: ActionHandler,
  preHandler?: ActionHandler | ActionHandlers,
  postHandler?: ActionHandler | ActionHandlers,
  handler: ActionHandler,
}

export type Command = {
  name: string,
  auth?: boolean | Function,
  validator?: ActionHandler,
  preHandler?: ActionHandler | ActionHandlers,
  postHandler?: ActionHandler | ActionHandlers,
  handler: ActionHandler,
  executables: Array<CommandeExecutable>,
}

export type Expectable = {
  type?: string | Array<string>,
  value?: any,
}

export type CommandeExecutable = {
  name: string,
  handler: ActionHandler,
  returnable?: boolean,
  transferable?: boolean,
  expects?: Expectable,
}

export const createCommand = (handler: Commandable | ActionHandler): Command => {

  let command: Command

  if (typeof handler === 'function') {
    // @ts-ignore
    command = {
      name: handler.name,
      handler,
    };
  }
  else {
    // @ts-ignore
    command = handler;
  }

  if ( ! command.name) {
    throw Error('Commands must be named functions - cannot create command.');
  }

  command.executables = getCommandExecutables(command, commandMethods)
  return command;
}

const getCommandExecutables = (command: Commandable, methods): Array<CommandeExecutable> =>
  methods.reduce((acc, curr) => {
    const callable = command[curr.name]
    if (Array.isArray(callable)) {
      const nested = callable.map(handler => ({
        ...curr,
        handler
      }))
      acc = [...acc, ...nested]
    }
    else if (callable) {
      acc = [...acc, { ...curr, handler: callable }]
    }
    return acc
  }, [])
