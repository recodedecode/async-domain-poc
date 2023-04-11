import chalk from 'chalk'
import { performance } from 'perf_hooks'


export const createReporter = (server, prefix) => {
  const startTime = performance.now()
  return {
    start: () => {
      server.log(['info'], `${prefix} Start executution.`)
    },
    finish: () => {
      server.log(['info'], `${prefix} Completed execution in ${executionTime(startTime)} milliseconds.`)
    },
    error: (err) => {
      server.log(['info'], `${prefix} Failed execution - an error occured after ${executionTime(startTime)} milliseconds.`)
      server.log(['error'], `${prefix} ${err.name}. ${err.message}`)
    },
  }
}

const executionTime = (startTime) => {
  const end = performance.now()
  const difference = end - startTime
  const result = difference.toFixed(4)
  if (process.env.NODE_ENV === 'development') {
    if (difference > 1000) {
      return chalk.red(result)
    }
    else if (difference > 250) {
      return chalk.yellow(result)
    }
  }
  return result
}
