import { Server } from '@hapi/hapi'
import { createLab } from '@makker/scripts'
import { createDomain, removeDomain, getDomains } from '../src/domain'


const {
  expect,
  describe,
  it
} = createLab(module)

describe('@makker/domain - create domain', () => {

  it(`should create a command from a function`, async () => {

    const myCommand = async (payload) => {
      return payload
    }

    const service = await createDomain({
      name: 'user',
      commands: [myCommand],
    })

    expect(getDomains().get('user')).to.be.object()
    expect(service).to.be.an.object()
    expect(service.name).to.equal('user')
    expect(service.commands).to.be.an.object().and.contain('user_my_command')
    expect(service.actions).to.be.an.object().and.contain('myCommand')
    expect(service.actions.myCommand()).to.be.an.object().and.contain({
      type: 'user_my_command',
    })

    removeDomain('user')
    expect(getDomains().get('user')).to.be.undefined()

  })

})
