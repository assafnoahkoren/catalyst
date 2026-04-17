import pino from 'pino'
import type { Logger } from 'pino'

const isAxiom = process.env.LOG_TRANSPORT === 'axiom'

function createTransport() {
  if (isAxiom) {
    return pino.transport({
      target: '@axiomhq/pino',
      options: {
        dataset: process.env.AXIOM_DATASET,
        token: process.env.AXIOM_TOKEN,
      },
    })
  }

  return pino.transport({
    target: 'pino-pretty',
    options: { colorize: true },
  })
}

export function createLogger(service: string): Logger {
  return pino(
    {
      level: process.env.LOG_LEVEL ?? 'info',
      base: { service },
    },
    createTransport(),
  )
}

export type { Logger }
