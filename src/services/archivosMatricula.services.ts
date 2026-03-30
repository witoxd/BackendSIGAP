import { transaction } from "../config/database"
import { ArchivoRepository } from "../models/Repository/ArchivoRepository"
import { MatriculaArchivoRepository } from "../models/Repository/MatriculaArchivoRepository"
import { MatriculaRepository } from "../models/Repository/MatriculaRepository"
import { AppError } from "../utils/AppError"


export class archivoMatriculaService {

  async asociarArchivoMatricula(personaId: number, matriculaId: number, archivo_id: number) {

    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    const archivo = await ArchivoRepository.findById(Number(archivo_id))
    if (!archivo) throw new AppError("Archivo no encontrado", 404)

    // El archivo debe pertenecer al estudiante de la matrícula
    // Esto evita que alguien asocie documentos de otra persona
    if (archivo.persona_id !== matricula.persona_id) {
      throw new AppError(
        "El archivo no pertenece al estudiante de esta matrícula",
        403
      )
    }

    const asociacion = await MatriculaArchivoRepository.asociar({
      matricula_id: matriculaId,
      archivo_id: archivo_id,
    })

    if (!asociacion) {
      throw new AppError("No se puedo asociar el archivo a la matricula", 500)
    }

  }

  async asociarBulkArchivoMatricula(personaId: number, matriculaId: number, archivo_id: number[]) {

    const matricula = await MatriculaRepository.findById(matriculaId)
    if (!matricula) throw new AppError("Matrícula no encontrada", 404)

    transaction(async (client) => {

      for (const id of archivo_id) {

        const archivo = await ArchivoRepository.findById(Number(archivo_id[id]))
        if (!archivo) throw new AppError("Archivo no encontrado", 404)

        if (archivo.persona_id !== matricula.persona_id) {
          throw new AppError(
            "El archivo no pertenece al estudiante de esta matrícula",
            403
          )
        }

        const asociacion = await MatriculaArchivoRepository.asociar({
          matricula_id: matriculaId,
          archivo_id: archivo_id[id],
        }, client)

        if (!asociacion) {
          throw new AppError("No se puedo asociar el archivo a la matricula", 500)
        }
      }
    }
      )
  }

}

