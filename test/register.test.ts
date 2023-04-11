import { Server } from '@hapi/hapi'
import { createLab, createServer } from '@makker/scripts'


const {
  afterEach,
  beforeEach,
  expect,
  describe,
  it
} = createLab(module)

describe('@makker/domain - register hapi plugin', () => {

  let server: Server

  beforeEach(async () => {
    server = await createServer()
  })

  afterEach(async () => {
    await server.stop()
  })

  it(`should register makker/domain @plugin`, async () => {

    let thrownError: Error | null = null

    try {
      await server.register({
        plugin: require('../src'),
      })
    }
    catch (err) {
      thrownError = err
    }

    expect(thrownError).to.not.be.an.error()
  })

})
