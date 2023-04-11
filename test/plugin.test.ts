import { Server } from '@hapi/hapi'
import { createLab, createServer } from '@makker/scripts'
import { createDomain, removeDomain } from '../src'


const {
  afterEach,
  beforeEach,
  expect,
  describe,
  it
} = createLab(module)

describe('@makker/domain - hapi plugin', () => {

  let server: Server

  beforeEach(async () => {
    server = await createServer()
    await server.register({
      plugin: require('../src'),
    })
  })

  afterEach(async () => {
    await removeDomain('foals')
    await server.stop()
  })

  it(`should enable domain commands to be executed from requests`, async () => {

    // Create a domain command
  
    const members = async (payload) => {
      return [
        `Yannis Philippakis`,
        `Jack Bevan`,
        `Jimmy Smith`,
        `Edwin Congreave`,
        ...payload
      ]
    }
    
    // Create the domain module

    await createDomain({
      name: 'foals',
      commands: [members],
    })

    // Add a route or request handler

    server.route({
      method: 'POST',
      path: '/foals/members',
      handler: async ({ actions, execute, payload }) => {
        const { members } = actions.foals
        return await execute(members(payload))
      }
    })

    await server.start()

    const res = await server.inject({
      method: 'post',
      url: '/foals/members',
      payload: [`Walter Gervers`, `Andrew Mears`]
    })

    const expected = [
      'Yannis Philippakis',
      'Jack Bevan',
      'Jimmy Smith',
      'Edwin Congreave',
      'Walter Gervers',
      'Andrew Mears'
    ]

    expect(res.statusCode).to.equal(200)
    expect(res.result).to.be.an.array().and.contain(expected)
  })

  it(`should enable domain queries to be fetched from requests`, async () => {

    // Create a domain query

    const albums = async () => {
      return [
        `Antidotes`,
        `Total Life Forever`,
        `Holy Fire`,
        `What Went Down`,
        `Everything Not Saved Will Be Lost – Part 1`
      ]
    }
    
    // Create the domain module

    await createDomain({
      name: 'foals',
      queries: [albums],
    })
  
    // Add a route or request handler

    server.route({
      method: 'GET',
      path: '/foals/albums',
      handler: async ({ actions, fetch }) => {
        const { albums } = actions.foals
        return await fetch(albums())
      }
    })

    await server.start()

    const res = await server.inject({
      method: 'get',
      url: '/foals/albums',
    })

    const expected = [
      `Antidotes`,
      `Total Life Forever`,
      `Holy Fire`,
      `What Went Down`,
      `Everything Not Saved Will Be Lost – Part 1`
    ]

    expect(res.statusCode).to.equal(200)
    expect(res.result).to.be.an.array().and.contain(expected)
  })

})
