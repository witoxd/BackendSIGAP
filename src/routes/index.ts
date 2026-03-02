import { Router } from "express"
import authRoutes from "./auth.routes"
import userRoutes from "./user.routes"
import personaRoutes from "./persona.routes"
import estudianteRoutes from "./estudiante.routes"
import profesorRoutes from "./profesor.routes"
import administrativoRoutes from "./administrativo.routes"
import cursoRoutes from "./curso.routes"
import matriculaRoutes from "./matricula.routes"
import roleRoutes from "./role.routes"
import jornadaRoutes from "./jornada.routes"
import tipoDocumentoRoutes from "./tipoDocumento.routes"
import archivoRoutes from "./archivo.routes"
import permisoRoutes from "./permiso.routes"
import egresadoRoutes from "./egresado.routes"
import acudienteRoutes from "./acudiente.routes"
import tipoArchivoRoutes from "./tipoArchivo.routes"
import auditoriaRoutes from "./auditoria.routes"

const router = Router()

router.use("/auth", authRoutes) //listo
router.use("/users", userRoutes) //listo
router.use("/personas", personaRoutes) //listo
router.use("/estudiantes", estudianteRoutes) //listo
router.use("/profesores", profesorRoutes) //listo
router.use("/administrativos", administrativoRoutes) //listo
router.use("/cursos", cursoRoutes) //listo
router.use("/matriculas", matriculaRoutes) // listo
router.use("/roles", roleRoutes) //En proceso
router.use("/jornadas", jornadaRoutes) //listo
router.use("/tipos-documento", tipoDocumentoRoutes)//listo
router.use("/archivos", archivoRoutes) //listo y configurado
router.use("/permisos", permisoRoutes) //No crear rutas, PELIGRO
router.use("/egresados", egresadoRoutes) //listo
router.use("/acudientes", acudienteRoutes) //listo
router.use("/tipos-archivos", tipoArchivoRoutes) // listo
//router.use("/auditoria", auditoriaRoutes)

export default router
