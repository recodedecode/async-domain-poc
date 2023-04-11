import { getDomainActions } from './domain'
import { createExecutionRunner } from './runner'


export {
  createDomain,
  removeDomain,
} from './domain'

export {
  useContext,
} from './context'

export {
  useAcl,
  useAuth,
  useDispatcher,
  useProvider,
  useRequest,
  useServer,
  useValidator,
} from './hooks'

export const plugin = {
  name: '@makker/domain',
  version: '0.1.0',
  dependencies: [],
  register: async (server: any) => {

    server.ext('onPostStart', () => {

      const actions = getDomainActions()
      const commandRunner = createExecutionRunner(server, 'commands')
      const queryRunner = createExecutionRunner(server, 'queries')
    
      server.decorate('request', 'actions', actions)
      server.decorate('request', 'execute', commandRunner, { apply: true })
      server.decorate('request', 'fetch', queryRunner, { apply: true })
    })

  },
}
