import { describe, expect, it } from 'vitest'
import { createLogger } from '../src/index'

describe('createLogger', () => {
  it('returns a pino logger instance', () => {
    const logger = createLogger('test-service')
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('sets the service name in base bindings', () => {
    const logger = createLogger('my-service')
    const bindings = logger.bindings()
    expect(bindings.service).toBe('my-service')
  })
})
