import joi from '@hapi/joi'
import { Server } from '@hapi/hapi'
import { createLab } from '@makker/scripts'
import { createCommand } from '../src/command'
import { execute } from '../src/execute'
import { useValidator } from '../src/hooks'


const {
  expect,
  describe,
  it
} = createLab(module)

describe('@makker/domain - useValidator', () => {

  it(`should validate a commands payload`, async () => {

    const schema = joi.object().keys({
      name: joi.string().required(),
    })

    const request = {
      payload: {
        name: 'validator',
        monkey: true,
      }
    }

    const expected = {
      name: 'validator',
    }

    const myCommand = async (input) => {
      const payload = await useValidator(schema, input)
      return payload
    }

    const command = createCommand(myCommand)
    const response = await execute(command, request)

    expect(response).to.be.an.object()
    expect(response).to.equal(expected)
  })

  it(`should validate a command without passing the payload`, async () => {

    const schema = joi.object().keys({
      name: joi.string().required(),
    })

    const request = {
      payload: {
        name: 'validator',
        monkey: true,
      }
    }

    const expected = {
      name: 'validator',
    }

    const myCommand = async () => {
      const payload = await useValidator(schema)
      return payload
    }

    const command = createCommand(myCommand)
    const response = await execute(command, request)

    expect(response).to.be.an.object()
    expect(response).to.equal(expected)
  })

  it(`should throw with an invalid payload`, async () => {

    let executed = 0

    const schema = joi.object().keys({
      name: joi.string().required(),
    })

    const request = {
      payload: {
        noname: 'none',
        monkey: true,
      }
    }

    const expected = {
      name: 'validator',
    }

    const myCommand = async () => {
      const payload = await useValidator(schema)
      executed ++
      return payload
    }

    const command = createCommand(myCommand)

    const rejects = () =>
      execute(command, request)

    const err = await expect(rejects()).to.reject(Error)
    expect(err.message).to.equal('ValidationPayloadError')
    expect(executed).to.equal(0)
  })

})
