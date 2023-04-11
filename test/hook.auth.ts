import joi from '@hapi/joi'
import { Server } from '@hapi/hapi'
import { createLab } from '@makker/scripts'
import { createCommand } from '../src/command'
import { execute } from '../src/execute'
import { useAuth } from '../src/hooks'


const {
  expect,
  describe,
  it
} = createLab(module)

describe('@makker/domain - useAuth', () => {

  it(`should allow a secured request for an authenticated user`, async () => {

    const request = {
      payload: 'secured',
      user: '1',
    }

    const expected = 'secured'

    const myGuardedCommand = async (payload) => {
      await useAuth()
      return payload
    }

    const command = createCommand(myGuardedCommand)
    const response = await execute(command, request)

    expect(response).to.be.a.string()
    expect(response).to.equal(expected)
  })

  it(`should deny a secured request for an authenticated user`, async () => {

    let executed = 0
  
    const request = {
      payload: 'secured',
    }

    const expected = 'secured'

    const myGuardedCommand = async (payload) => {
      await useAuth()
      executed ++
      return payload
    }

    const command = createCommand(myGuardedCommand)

    const rejects = () =>
      execute(command, request)

    const err = await expect(rejects()).to.reject(Error)
    expect(err.message).to.equal('Unauthorized')
    expect(executed).to.equal(0)
  })

  it(`should allow resource access to a user with appropriate permissions`, async () => {

    const context = {
      acl: {
        isAllowed: () => Promise.resolve(true),
      }
    }

    const request = {
      payload: 'secured',
      user: '1',
    }

    const expected = 'secured'

    const myGuardedCommand = async (payload) => {
      await useAuth('2', 'edit')
      return payload
    }

    const command = createCommand(myGuardedCommand)
    const response = await execute(command, request, context)

    expect(response).to.be.a.string()
    expect(response).to.equal(expected)
  })

  it(`should deny resource access to a user with appropriate permissions`, async () => {

    let executed = 0

    const context = {
      acl: {
        isAllowed: () => Promise.reject(),
      }
    }

    const request = {
      payload: 'secured',
      user: '1',
    }

    const expected = 'secured'

    const myGuardedCommand = async (payload) => {
      await useAuth('2', 'edit')
      executed ++
      return payload
    }

    const command = createCommand(myGuardedCommand)

    const rejects = () =>
      execute(command, request, context)

    const err = await expect(rejects()).to.reject(Error)
    expect(err.message).to.equal('Unauthorized')
    expect(executed).to.equal(0)
  })

})
