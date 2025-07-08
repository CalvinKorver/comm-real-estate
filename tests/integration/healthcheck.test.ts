import { describe, it, expect } from 'vitest'

describe('Healthcheck API', () => {
  it('should return 200 status for healthcheck endpoint', async () => {
    const response = await fetch('http://localhost:3001/api/healthcheck')
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.timestamp).toBeDefined()
    expect(typeof data.timestamp).toBe('string')
  })
})