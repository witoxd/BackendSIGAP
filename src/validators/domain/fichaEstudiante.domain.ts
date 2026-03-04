import type { Request, Response, NextFunction } from "express"
import { FichaEstudiante } from "../../models/sequelize/FichaEstudiante"
import { ColegioAnterior } from "../../models/sequelize/ColegioAnterior"
import { ViviendaEstudiante } from "../../models/sequelize/ViviendaEstudiante"
import { ValidationError } from "sequelize"

// =============================================================================
// FICHA ESTUDIANTE
// =============================================================================

export const validateUpsertFichaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ficha } = req.body

    await FichaEstudiante.build(ficha).validate({ skip: ["estudiante_id"] })

    // Regla de negocio adicional que Sequelize no puede expresar:
    // posicion_hermanos no puede ser mayor que numero_hermanos
    // (no puedes ser el 5to hijo si solo hay 3 hermanos)
    if (
      ficha.posicion_hermanos !== undefined &&
      ficha.numero_hermanos   !== undefined &&
      ficha.posicion_hermanos > ficha.numero_hermanos
    ) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: [{
          field: "ficha.posicion_hermanos",
          message: "La posición entre hermanos no puede ser mayor al número de hermanos",
        }],
      })
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }
    next(error)
  }
}

// =============================================================================
// COLEGIOS ANTERIORES — crear uno
// =============================================================================

export const validateCreateColegioDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { colegio } = req.body

    await ColegioAnterior.build(colegio).validate({ skip: ["estudiante_id"] })

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }
    next(error)
  }
}

// =============================================================================
// COLEGIOS ANTERIORES — replaceAll
// =============================================================================

export const validateReplaceColegiosDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { colegios } = req.body

    // Validar cada elemento con el modelo Sequelize
    for (const colegio of colegios) {
      await ColegioAnterior.build(colegio).validate({ skip: ["estudiante_id"] })
    }

    // Regla de negocio: no puede haber duplicados de nombre_colegio + anio
    // en la misma lista (no tiene sentido el mismo colegio dos veces en el mismo año)
    const seen = new Set<string>()
    for (const c of colegios) {
      const key = `${c.nombre_colegio?.toLowerCase()}-${c.anio ?? "s/a"}`
      if (seen.has(key)) {
        return res.status(400).json({
          success: false,
          message: "Error de validación de dominio",
          errors: [{
            field: "colegios",
            message: `El colegio "${c.nombre_colegio}" aparece duplicado en la lista`,
          }],
        })
      }
      seen.add(key)
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }
    next(error)
  }
}

// =============================================================================
// COLEGIOS ANTERIORES — actualizar uno
// =============================================================================

export const validateUpdateColegioDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { colegio } = req.body

    // Se salta nombre_colegio porque en update es opcional
    await ColegioAnterior.build(colegio).validate({
      skip: ["estudiante_id", "nombre_colegio"],
    })

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }
    next(error)
  }
}

// =============================================================================
// VIVIENDA ESTUDIANTE
// =============================================================================

export const validateUpsertViviendaDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { vivienda } = req.body

    await ViviendaEstudiante.build(vivienda).validate({ skip: ["estudiante_id"] })

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }
    next(error)
  }
}

// =============================================================================
// EXPEDIENTE COMPLETO
// Valida cada sección presente usando sus propios modelos Sequelize.
// Las secciones ausentes se saltan — el expediente se puede guardar parcialmente.
// =============================================================================

export const validateUpsertExpedienteDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ficha, colegios, vivienda } = req.body

    if (ficha) {
      await FichaEstudiante.build(ficha).validate({ skip: ["estudiante_id"] })

      if (
        ficha.posicion_hermanos !== undefined &&
        ficha.numero_hermanos   !== undefined &&
        ficha.posicion_hermanos > ficha.numero_hermanos
      ) {
        return res.status(400).json({
          success: false,
          message: "Error de validación de dominio",
          errors: [{
            field: "ficha.posicion_hermanos",
            message: "La posición entre hermanos no puede ser mayor al número de hermanos",
          }],
        })
      }
    }

    if (colegios) {
      for (const colegio of colegios) {
        await ColegioAnterior.build(colegio).validate({ skip: ["estudiante_id"] })
      }

      const seen = new Set<string>()
      for (const c of colegios) {
        const key = `${c.nombre_colegio?.toLowerCase()}-${c.anio ?? "s/a"}`
        if (seen.has(key)) {
          return res.status(400).json({
            success: false,
            message: "Error de validación de dominio",
            errors: [{
              field: "colegios",
              message: `El colegio "${c.nombre_colegio}" aparece duplicado en la lista`,
            }],
          })
        }
        seen.add(key)
      }
    }

    if (vivienda) {
      await ViviendaEstudiante.build(vivienda).validate({ skip: ["estudiante_id"] })
    }

    next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación de dominio",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      })
    }
    next(error)
  }
}