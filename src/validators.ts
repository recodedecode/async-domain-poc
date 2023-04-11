import joi from '@hapi/joi'


export const domainActionSchema = joi.object().keys({
  id: joi.string(),
  domain: joi.string().required(),
  type: joi.string().required(),
  payload: joi.alternatives().try([
    joi.string(),
    joi.number(),
    joi.object(),
  ]),
  auth: joi.boolean(),
  schema: joi.object(),
  userId: joi.alternatives().try([
    joi.string().allow(''),
    joi.number(),
  ]),
})

const commandHandler = joi.func().maxArity(1)

export const domainCommandSchema = joi.alternatives().try([
  commandHandler,
  joi.object().keys({
    name: joi.string().required(),
    auth: joi.boolean(),
    schema: joi.object(),
    handler: commandHandler.required(),
    before: joi.alternatives().try([
      commandHandler,
      joi.array().items(commandHandler),
    ]),
    after: joi.alternatives().try([
      commandHandler,
      joi.array().items(commandHandler),
    ]),
  }),
])

export const domainQuerySchema = joi.alternatives().try([
  commandHandler,
  joi.object().keys({
    name: joi.string().required(),
    auth: joi.boolean(),
    schema: joi.object(),
    handler: joi.func().required(),
  })
])

export const domainSchema = joi.object().keys({
  name: joi.string().required(),
  commands: joi.array().items(domainCommandSchema).default([]),
  context: joi.object(),
  queries: joi.array().items(domainQuerySchema).default([]),
})
