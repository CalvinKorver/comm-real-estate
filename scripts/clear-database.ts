import { prisma } from '../lib/shared/prisma';

async function clearDatabase() {
  console.log('🔄 Starting database cleanup...');
  
  try {
    // Clear in the correct order to respect foreign key constraints
    console.log('🗑️  Clearing coordinates...');
    await prisma.coordinate.deleteMany({});
    console.log('✅ Coordinates cleared');

    console.log('🗑️  Clearing property images...');
    await prisma.propertyImage.deleteMany({});
    console.log('✅ Property images cleared');

    console.log('🗑️  Clearing contacts...');
    await prisma.contact.deleteMany({});
    console.log('✅ Contacts cleared');

    console.log('🗑️  Clearing property lists...');
    await prisma.propertyList.deleteMany({});
    console.log('✅ Property lists cleared');

    console.log('🗑️  Clearing lists...');
    await prisma.list.deleteMany({});
    console.log('✅ Lists cleared');

    console.log('🗑️  Clearing properties...');
    await prisma.property.deleteMany({});
    console.log('✅ Properties cleared');

    console.log('🗑️  Clearing owners...');
    await prisma.owner.deleteMany({});
    console.log('✅ Owners cleared');

    // Get counts to verify
    const coordinateCount = await prisma.coordinate.count();
    const propertyImageCount = await prisma.propertyImage.count();
    const contactCount = await prisma.contact.count();
    const propertyListCount = await prisma.propertyList.count();
    const listCount = await prisma.list.count();
    const propertyCount = await prisma.property.count();
    const ownerCount = await prisma.owner.count();

    console.log('\n📊 Database cleanup completed!');
    console.log('Remaining records:');
    console.log(`  - Coordinates: ${coordinateCount}`);
    console.log(`  - Property Images: ${propertyImageCount}`);
    console.log(`  - Contacts: ${contactCount}`);
    console.log(`  - Property Lists: ${propertyListCount}`);
    console.log(`  - Lists: ${listCount}`);
    console.log(`  - Properties: ${propertyCount}`);
    console.log(`  - Owners: ${ownerCount}`);

    if (coordinateCount === 0 && propertyImageCount === 0 && contactCount === 0 && propertyListCount === 0 && listCount === 0 && propertyCount === 0 && ownerCount === 0) {
      console.log('✅ All data successfully cleared!');
    } else {
      console.log('⚠️  Some data may still remain');
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log('🎉 Database cleanup script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database cleanup script failed:', error);
      process.exit(1);
    });
}

export { clearDatabase }; 