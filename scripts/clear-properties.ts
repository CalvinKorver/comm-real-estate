import { prisma } from '../lib/shared/prisma';
import { Owner, Property } from '../generated/prisma';

async function main() {
  console.log('Deleting all property-related data...');

  // Delete all contacts for owners of properties
  const ownerIds = await prisma.owner.findMany({
    select: { id: true },
    where: {
      properties: {
        some: {},
      },
    },
  });
  const ownerIdList = ownerIds.map((o: { id: string }) => o.id);

  const deleteContacts = prisma.contact.deleteMany({
    where: {
      owner_id: { in: ownerIdList },
    },
  });

  // Delete all notes for properties
  const propertyIds = await prisma.property.findMany({ select: { id: true } });
  const propertyIdList = propertyIds.map((p: { id: string }) => p.id);

  const deleteNotes = prisma.note.deleteMany({
    where: {
      property_id: { in: propertyIdList },
    },
  });

  // Delete all property images
  const deleteImages = prisma.propertyImage.deleteMany({
    where: {
      property_id: { in: propertyIdList },
    },
  });

  // Delete all coordinates
  const deleteCoordinates = prisma.coordinate.deleteMany({
    where: {
      property_id: { in: propertyIdList },
    },
  });

  // Delete all properties
  const deleteProperties = prisma.property.deleteMany();

  // Delete owners that are not associated with any properties anymore
  const deleteOrphanOwners = prisma.owner.deleteMany({
    where: {
      properties: { none: {} },
    },
  });

  // Run all deletions in order
  const [contacts, notes, images, coords, properties, orphanOwners] = await prisma.$transaction([
    deleteContacts,
    deleteNotes,
    deleteImages,
    deleteCoordinates,
    deleteProperties,
    deleteOrphanOwners,
  ]);

  console.log(`Deleted: ${contacts.count} contacts, ${notes.count} notes, ${images.count} images, ${coords.count} coordinates, ${properties.count} properties, ${orphanOwners.count} orphan owners.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 