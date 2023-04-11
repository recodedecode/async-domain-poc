import { Server } from '@hapi/hapi'
import { createLab } from '@makker/scripts'
import { createCommand } from '../src/command'
import { execute } from '../src/execute'


const {
  expect,
  describe,
  it
} = createLab(module)

describe('@makker/domain - execute command', () => {

  it(`should execute a function command`, async () => {

    const request = {
      payload: {
        seasons: 'seasons',
      }
    }

    const myCommand = async (payload) => {
      return payload
    }

    const command = createCommand(myCommand)
    const response = await execute(command, request)

    expect(response).to.be.an.object()
    expect(response).to.equal(request.payload)

  })

  it(`should execute a configured command`, async () => {

    let postHandlerValue

    // Create command

    const myCommand = {
      name: 'myCommand',
      auth: () => {
        return true
      },
      validator: (payload) => {
        return payload
      },
      handler: async (payload) => {
        return payload
      },
      before: [payload => ({
        ...payload,
        summer: 'summer',
      }), payload => ({
        ...payload,
        winter: 'winter',
      })],
      after: (payload) => {
        postHandlerValue = payload
      }
    }

    const command = createCommand(myCommand)

    expect(command).to.be.an.object()
    expect(command.name).to.equal('myCommand')

    // Create request

    const request = {
      payload: {
        autumn: 'autumn',
      }
    }

    // Execute command with request

    const response = await execute(command, request)

    const expected= {
      autumn: 'autumn',
      winter: 'winter',
      summer: 'summer'
    }

    expect(response).to.be.an.object()
    expect(response).to.contain(expected)
    expect(postHandlerValue).to.equal(expected)

  })

})
