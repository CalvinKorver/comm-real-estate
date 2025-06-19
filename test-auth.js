// test-auth.js
const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    // Test user data
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log('User exists:', existingUser.email);
      
      // Test password verification
      const isValid = await bcrypt.compare(testPassword, existingUser.password);
      console.log('Password valid:', isValid);
      
      if (isValid) {
        console.log('Authentication should work for this user');
      } else {
        console.log('Password verification failed');
      }
    } else {
      console.log('User does not exist');
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth(); 