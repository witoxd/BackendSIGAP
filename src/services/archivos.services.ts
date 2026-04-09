import path from "path";
import { deleteFile, getFileUrl } from "../config/multer";
import { PersonaRepository } from "../models/Repository/PersonaRepository";
import { TipoArchivoRepository } from "../models/Repository/TipoArchivoRepository";
import { AppError } from "../utils/AppError";
import { ArchivoRepository } from "../models/Repository/ArchivoRepository";

type ArchivoMetadataInput = {
    tipo_archivo_id: number | string;
    descripcion?: string | null;
}

export class archivoService {

    static async deleteFileArray(files: Express.Multer.File[]) {
        try {
            await Promise.all(files.map(file => deleteFile(file.path)))
        } catch (error) {
            console.error("Error limpiado archivos: ", error)
        }
    }


    static normalizeMetadata(metadata: unknown): ArchivoMetadataInput[] {
        if (!metadata) {
            return []
        }

        if (typeof metadata === "string") {
            try {
                const parsedMetadata = JSON.parse(metadata)
                if (!Array.isArray(parsedMetadata)) {
                    throw new AppError("El formato de metadata no es válido", 400)
                }
                return parsedMetadata
            } catch (error) {
                if (error instanceof AppError) {
                    throw error
                }
                throw new AppError("El formato de metadata no es válido", 400)
            }
        }

        if (Array.isArray(metadata)) {
            return metadata.map((item) => {
                if (typeof item === "string") {
                    try {
                        return JSON.parse(item)
                    } catch {
                        throw new AppError("El formato de metadata no es válido", 400)
                    }
                }

                return item
            })
        }

        throw new AppError("El formato de metadata no es válido", 400)
    }


    static async RegisterFileArray(
        files: Express.Multer.File[],
        metadata: ArchivoMetadataInput[],
        personaId: number,
        userId: number,
        client?: any
    ) {
        try {

            if (!files || files.length === 0) {
                throw new AppError("Se requiere al menos un archivo", 400)
            }

            // Verificar que la persona existe
            const persona = await PersonaRepository.findById(personaId)
            if (!persona) {
                await archivoService.deleteFileArray(files)
                throw new AppError("Persona no encontrada", 404)
            }

            // Validar que haya metadata para cada archivo
            if (metadata.length !== files.length) {
                await archivoService.deleteFileArray(files)
                throw new AppError(
                    `Se requiere metadata para cada archivo. Archivos: ${files.length}, Metadata: ${metadata.length}`,
                    400
                )
            }

             // Construir array de datos con validaciones
                  const archivosData = []
                  for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    const meta = metadata[i]

                    if (!meta || meta.tipo_archivo_id === undefined || meta.tipo_archivo_id === null) {
                        await archivoService.deleteFileArray(files)
                        throw new AppError(`Falta tipo_archivo_id en la metadata del archivo ${file.originalname}`, 400)
                    }

                    const tipoArchivoId = Number(meta.tipo_archivo_id)
                    if (Number.isNaN(tipoArchivoId) || tipoArchivoId <= 0) {
                        await archivoService.deleteFileArray(files)
                        throw new AppError(`tipo_archivo_id inválido en la metadata del archivo ${file.originalname}`, 400)
                    }
            
                    // Verificar tipo de archivo
                    const tipoArchivo = await TipoArchivoRepository.findById(tipoArchivoId)
                    if (!tipoArchivo) {
                      await archivoService.deleteFileArray(files)
                      throw new AppError(`Tipo de archivo con ID ${tipoArchivoId} no encontrado`, 404)
                    }
            
                    // Verificar que la persona tiene permiso para subir este tipo de archivo
                    const personaPuedeSubirArchivo = await PersonaRepository.personaPuedeSubirArchivo(personaId, tipoArchivoId)
                    if (!personaPuedeSubirArchivo) {
                      await archivoService.deleteFileArray(files)
                      throw new AppError(`La persona no tiene permiso para subir este tipo de archivo: ${tipoArchivoId}`, 403)
                    }
            
                    // Verificar extensión permitida
                    const ext = path.extname(file.originalname).toLowerCase()
                    const isAllowed = await TipoArchivoRepository.isExtensionAllowed(tipoArchivoId, ext)
                    if (!isAllowed) {
                      await archivoService.deleteFileArray(files)
                      throw new AppError(
                        `La extensión ${ext} no está permitida para ${tipoArchivo.nombre} (archivo: ${file.originalname})`,
                        400
                      )
                    }
            
                    archivosData.push({
                      persona_id: personaId,
                      tipo_archivo_id: tipoArchivoId,
                      nombre: file.originalname,
                      descripcion: meta.descripcion || undefined,
                      url_archivo: getFileUrl(file),
                      asignado_por: userId,
                    })
                  }

                    const archivos = await ArchivoRepository.bulkCreate(archivosData, client)
                    return archivos.map((archivo: any, index: number) => ({
                        ...archivo,
                        file_info: {
                            originalName: files[index].originalname,
                            size: files[index].size,
                            mimetype: files[index].mimetype,
                        },
                    }))

        } catch (error) {
            await archivoService.deleteFileArray(files)
            throw error
        }
    }



}
