import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { vigente } = req.query;
    const where: any = {};
    
    if (vigente !== undefined) {
      where.vigente = vigente === 'true';
    }

    const grupos = await prisma.grupo.findMany({
      where,
      include: {
        grupoAfiliados: {
          where: { hasta: null },
          include: { afiliado: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json(grupos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching grupos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        grupoAfiliados: {
          include: { afiliado: true }
        }
      }
    });

    if (!grupo) {
      return res.status(404).json({ error: 'Grupo not found' });
    }

    res.json(grupo);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching grupo' });
  }
});

router.post('/', [
  body('nombre').notEmpty().withMessage('Nombre is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const grupo = await prisma.grupo.create({
      data: {
        ...req.body,
        creadoPor: 'system'
      }
    });

    res.status(201).json(grupo);
  } catch (error) {
    res.status(500).json({ error: 'Error creating grupo' });
  }
});

router.post('/:id/afiliados', [
  body('afiliadoId').isInt().withMessage('Valid afiliado ID is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { afiliadoId } = req.body;
    const grupoId = parseInt(req.params.id);

    const existing = await prisma.grupoAfiliado.findFirst({
      where: {
        grupoId,
        afiliadoId,
        hasta: null
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Afiliado already in group' });
    }

    const grupoAfiliado = await prisma.grupoAfiliado.create({
      data: {
        grupoId,
        afiliadoId
      }
    });

    res.status(201).json(grupoAfiliado);
  } catch (error) {
    res.status(500).json({ error: 'Error adding afiliado to grupo' });
  }
});

router.delete('/:id/afiliados/:afiliadoId', async (req, res) => {
  try {
    const grupoId = parseInt(req.params.id);
    const afiliadoId = parseInt(req.params.afiliadoId);

    await prisma.grupoAfiliado.updateMany({
      where: {
        grupoId,
        afiliadoId,
        hasta: null
      },
      data: {
        hasta: new Date()
      }
    });

    res.json({ message: 'Afiliado removed from grupo successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing afiliado from grupo' });
  }
});

export default router;
