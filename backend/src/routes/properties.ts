import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all properties
router.get('/', async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owners: true,
      },
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get a single property
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        owners: true,
      },
    });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Create a new property
router.post('/', async (req: Request, res: Response) => {
  try {
    const property = await prisma.property.create({
      data: req.body,
      include: {
        owners: true,
      },
    });
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Update a property
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        owners: true,
      },
    });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Delete a property
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.property.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router; 