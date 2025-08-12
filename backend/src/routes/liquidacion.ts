import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { TipoLiquidacion, EstadoLiquidacion, EstadoAfiliado } from '@prisma/client';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { tipo, estado, periodoDesde, periodoHasta } = req.query;
    const where: any = {};
    
    if (tipo) where.tipo = tipo as TipoLiquidacion;
    if (estado) where.estado = estado as EstadoLiquidacion;
    if (periodoDesde) where.periodoDesde = { gte: new Date(periodoDesde as string) };
    if (periodoHasta) where.periodoHasta = { lte: new Date(periodoHasta as string) };

    const liquidaciones = await prisma.liquidacion.findMany({
      where,
      include: {
        grupo: true,
        detalles: {
          include: { afiliado: true }
        }
      },
      orderBy: { creadoEn: 'desc' }
    });

    res.json(liquidaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching liquidaciones' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const liquidacion = await prisma.liquidacion.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        grupo: true,
        detalles: {
          include: { afiliado: true }
        },
        snapshots: {
          include: { afiliado: true }
        }
      }
    });

    if (!liquidacion) {
      return res.status(404).json({ error: 'Liquidacion not found' });
    }

    res.json(liquidacion);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching liquidacion' });
  }
});

router.post('/', [
  body('periodoDesde').isISO8601().withMessage('Valid periodo desde is required'),
  body('periodoHasta').isISO8601().withMessage('Valid periodo hasta is required'),
  body('tipo').isIn(['INDIVIDUAL', 'GRUPAL']).withMessage('Valid tipo is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const liquidacion = await prisma.liquidacion.create({
      data: {
        ...req.body,
        creadoPor: 'system'
      }
    });

    res.status(201).json(liquidacion);
  } catch (error) {
    res.status(500).json({ error: 'Error creating liquidacion' });
  }
});

router.post('/:id/confirmar', async (req, res) => {
  try {
    const liquidacionId = parseInt(req.params.id);
    
    const liquidacion = await prisma.liquidacion.findUnique({
      where: { id: liquidacionId },
      include: { detalles: true, grupo: true }
    });

    if (!liquidacion) {
      return res.status(404).json({ error: 'Liquidacion not found' });
    }

    if (liquidacion.estado !== EstadoLiquidacion.BORRADOR) {
      return res.status(400).json({ error: 'Only BORRADOR liquidaciones can be confirmed' });
    }

    const totalBruto = liquidacion.detalles.reduce((sum, d) => sum + Number(d.haberesBrutos), 0);
    const totalDescuentos = liquidacion.detalles.reduce((sum, d) => sum + Number(d.descuentos), 0);
    const totalNeto = totalBruto - totalDescuentos;

    const updatedLiquidacion = await prisma.liquidacion.update({
      where: { id: liquidacionId },
      data: {
        estado: EstadoLiquidacion.CONFIRMADA,
        totalBruto,
        totalDescuentos,
        totalNeto,
        confirmadoEn: new Date(),
        confirmadoPor: 'system'
      }
    });

    if (liquidacion.tipo === TipoLiquidacion.GRUPAL && liquidacion.grupoId) {
      const miembrosVigentes = await prisma.grupoAfiliado.findMany({
        where: {
          grupoId: liquidacion.grupoId,
          hasta: null,
          afiliado: { estado: EstadoAfiliado.ACTIVO }
        }
      });

      await prisma.liquidacionGrupoSnapshot.createMany({
        data: miembrosVigentes.map(m => ({
          liquidacionId,
          afiliadoId: m.afiliadoId
        }))
      });
    }

    res.json(updatedLiquidacion);
  } catch (error) {
    res.status(500).json({ error: 'Error confirming liquidacion' });
  }
});

router.get('/afiliado/:afiliadoId/historial', async (req, res) => {
  try {
    const afiliadoId = parseInt(req.params.afiliadoId);
    
    const historial = await prisma.liquidacionDetalle.findMany({
      where: { afiliadoId },
      include: {
        liquidacion: {
          include: { grupo: true }
        }
      },
      orderBy: { liquidacion: { periodoHasta: 'desc' } }
    });

    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching historial' });
  }
});

export default router;
