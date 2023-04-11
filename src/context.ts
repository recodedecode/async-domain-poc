// Checkout - https://blog.besson.co/nodejs_async_hooks_to_get_per_request_context/
import async_hooks from 'async_hooks'


type RequestContext = {
  [key: string]: any,
}

type ContextCreator = (context: RequestContext) => void

const contexts = new Map<number, RequestContext>()

async_hooks.createHook({
  init: (asyncId: number, type: string, triggerAsyncId: number) => {
    const context = contexts.get(triggerAsyncId)
    if (context) {
      contexts.set(asyncId, context)
    }
  },
  destroy: (asyncId: number) => {
    contexts.delete(asyncId)
  },
}).enable()


export const createContext = async (fn: ContextCreator, defaults = {}) => {
  const asyncResource = new async_hooks.AsyncResource('REQUEST_CONTEXT')
  return asyncResource.runInAsyncScope(() => {
    const asyncId = async_hooks.executionAsyncId()
    contexts.set(asyncId, defaults)
    // @ts-ignore
    return fn(contexts.get(asyncId))
  })
}

export const useContext = (): RequestContext => {
  const asyncId = async_hooks.executionAsyncId()
  return contexts.get(asyncId) || {}
}
