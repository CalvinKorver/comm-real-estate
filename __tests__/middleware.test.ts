import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

describe('Middleware', () => {
  const mockGetToken = require('next-auth/jwt').getToken;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should block access to signup page and redirect to signin', async () => {
    mockGetToken.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/auth/signup');
    const response = await middleware(request);

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe('http://localhost:3000/auth/signin');
  });

  it('should allow access to signin page', async () => {
    mockGetToken.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/auth/signin');
    const response = await middleware(request);

    // Middleware continues (no redirect) - NextResponse.next() returns a response
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
  });

  it('should allow access to marketing page', async () => {
    mockGetToken.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/marketing');
    const response = await middleware(request);

    // Middleware continues (no redirect) - NextResponse.next() returns a response
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
  });

  it('should redirect to signin for protected routes when not authenticated', async () => {
    mockGetToken.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/workouts');
    const response = await middleware(request);

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe('http://localhost:3000/auth/signin');
  });
}); 