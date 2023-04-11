import { createError } from 'apollo-errors'


export const ActionError = createError('ActionError', {
  message: 'There was an internal problem processing this request.',
})

export const CommandError = createError('CommandError', {
  message: 'There was an internal problem processing this request.',
})

export const ForbiddenError = createError('ForbiddenError', {
  message: 'Forbidden - you are not authorized to fulfil this request.',
})

export const QueryError = createError('QueryError', {
  message: 'There was an internal problem processing this request.',
})

export const ValidationError = createError('ValidationError', {
  message: 'Invalid input - the request failed validation and cannot be processed.',
})

export const UnauthorizedError = createError('Unauthorized', {
  message: 'Unauthorized',
})
