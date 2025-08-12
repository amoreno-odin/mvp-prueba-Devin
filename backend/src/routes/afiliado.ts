import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { EstadoAfiliado } from '@prisma/client';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('GET /api/afiliados - Starting request');
    const { estado, search } = req.query;
    const where: any = {};
    
    if (estado) {
      where.estado = estado as EstadoAfiliado;
    }
    
    if (search) {
      where.OR = [
        { nombres: { contains: search as string, mode: 'insensitive' } },
        { apellido: { contains: search as string, mode: 'insensitive' } },
        { nLegajo: { contains: search as string, mode: 'insensitive' } },
        { nroDoc: { contains: search as string } }
      ];
    }

    console.log('Querying database with where:', where);
    const afiliados = await prisma.afiliado.findMany({
      where,
      orderBy: { apellido: 'asc' }
    });

    console.log('Found afiliados:', afiliados.length);
    res.json(afiliados);
  } catch (error) {
    console.error('Error in GET /api/afiliados:', error);
    res.status(500).json({ error: 'Error fetching afiliados' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const afiliado = await prisma.afiliado.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        grupoAfiliados: {
          include: { grupo: true }
        },
        liquidacionDetalles: {
          include: { liquidacion: true }
        }
      }
    });

    if (!afiliado) {
      return res.status(404).json({ error: 'Afiliado not found' });
    }

    res.json(afiliado);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching afiliado' });
  }
});

router.post('/', [
  body('nLegajo').notEmpty().withMessage('N° Legajo is required'),
  body('tipoDoc').notEmpty().withMessage('Tipo documento is required'),
  body('nroDoc').notEmpty().withMessage('N° documento is required'),
  body('apellido').notEmpty().withMessage('Apellido is required'),
  body('nombres').notEmpty().withMessage('Nombres is required'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const afiliado = await prisma.afiliado.create({
      data: {
        ...req.body,
        creadoPor: 'system',
        modificadoPor: 'system'
      }
    });

    res.status(201).json(afiliado);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Documento ya registrado' });
    }
    res.status(500).json({ error: 'Error creating afiliado' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const afiliado = await prisma.afiliado.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...req.body,
        modificadoPor: 'system'
      }
    });

    res.json(afiliado);
  } catch (error) {
    res.status(500).json({ error: 'Error updating afiliado' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.afiliado.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        estado: EstadoAfiliado.INACTIVO,
        modificadoPor: 'system'
      }
    });

    res.json({ message: 'Afiliado inactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error inactivating afiliado' });
  }
});

export default router;
