import { Server } from '@hapi/hapi'
import { createLab } from '@makker/scripts'
import { createCommand } from '../src/command'


const {
  expect,
  describe,
  it
} = createLab(module)

describe('@makker/domain - create command', () => {

  it(`should create a command from a function`, async () => {

    const myCommand = async () => {
      return 'my command'
    }

    const command = createCommand(myCommand)
    expect(command).to.be.an.object()
    expect(command.name).to.equal('myCommand')
  })

  it(`should create a command from a command object`, async () => {

    const myCommand = {
      name: 'myCommand',
      handler: async () => {
        return 'my command'
      }
    }

    const command = createCommand(myCommand)
    expect(command).to.be.an.object()
    expect(command.name).to.equal('myCommand')
  })

})
