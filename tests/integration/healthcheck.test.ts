import { describe, it, expect } from 'vitest'
import { testFetch } from '../utils/test-config'

describe('Healthcheck API', () => {
  it('should return 200 status for healthcheck endpoint', async () => {
    const response = await testFetch('/api/healthcheck')
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.timestamp).toBeDefined()
    expect(typeof data.timestamp).toBe('string')
  })
})