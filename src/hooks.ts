import { Request, Server } from '@hapi/hapi'
import { Acl } from 'acl'
import { useContext } from './context'


export const useAcl = (): Acl => {
  const { acl } = useContext()
  return acl
}

export const useAuth = async (resource?: string, scopes?: string | Array<string>): Promise<boolean> => {
  const request = useRequest()

  if (resource && scopes) {
    try {
      const { acl } = useContext()
      return await acl.isAllowed(request.user, resource, scopes)
    }
    catch (err) {
      throw Error('Unauthorized')
    }
  }

  if (request.user) {
    return true
  }

  throw Error('Unauthorized')
}

export const useDispatcher = (): Request => {
  const { server } = useContext()
  return server
}

export const useProvider = (...requestedProviders) => {
  const { providers } = useContext()
}

export const useRequest = (): Request => {
  const { request } = useContext()
  return request
}

export const useServer = (): Server => {
  const { server } = useContext()
  return server
}

export const useValidator = (schema, payload: any) => {

  if ( ! schema) {
    // Maybe. We could reach into the context to see if there is a validator
    // that has been added with the same name?
    throw Error(`ValidationSchemaError`)
  }

  if ( ! payload) {
    const request = useRequest()
    payload = request.payload
  }

  const { error, value } = schema.validate(payload, { stripUnknown: true })

  if (error) {
    throw Error(`ValidationPayloadError`)
  }

  return value
}
