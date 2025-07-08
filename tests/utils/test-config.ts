// Test configuration utilities

/**
 * Get the base URL for API requests
 * Both CI and local environments use port 3001 and IPv4 localhost for consistency
 */
export function getTestBaseUrl(): string {
  return 'http://127.0.0.1:3001'
}

/**
 * Make a test API request with proper URL and error handling
 * Includes retry logic for CI environment stability
 */
export async function testFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getTestBaseUrl()
  const url = `${baseUrl}${endpoint}`
  const maxRetries = 3
  const retryDelay = 1000 // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Making test request to: ${url} (attempt ${attempt}/${maxRetries})`)
      
      const response = await fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 seconds
      })
      
      console.log(`Request successful: ${response.status} ${response.statusText}`)
      return response
    } catch (error) {
      console.error(`Test fetch attempt ${attempt} failed for ${url}:`, error)
      
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed for ${url}`)
        throw error
      }
      
      // Wait before retrying
      console.log(`Retrying in ${retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Unexpected error in testFetch')
}