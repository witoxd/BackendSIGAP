import { Router }      from "express"
import { writeLimiter } from "../middleware/rateLimiter"
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
import fichaEstudianteRoutes from "./fichaEstudiante.routes"
import contactos from "./contacto.routes"
import  PeriodoMatricula  from "./periodoMatricula.routes"
import procesoInscripcionRoutes from "./procesoInscripcion.routes"
import directorGrupoRoutes from "./directorGrupo.routes"
import asignacionDocenteRoutes from "./asignacionDocente.routes"
import reemplazoProfesorRoutes from "./reemplazoProfesor.routes"
import decretoRoutes from "./decreto.routes"
import gradoEscalafonRoutes from "./gradoEscalafon.routes"
import auditoriaRoutes from "./auditoria.routes"
const router = Router()

// Limiter de escrituras: POST / PUT / PATCH / DELETE en toda la API.
// Se excluyen las rutas de auth (tienen su propio limiter más estricto aplicado
// directamente en auth.routes.ts). El keyGenerator usa userId del JWT.
router.use((req, res, next) => {
  const esEscritura = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  const esAuth      = req.path.startsWith("/auth")
  if (esEscritura && !esAuth) {
    writeLimiter(req, res, next)
    return
  }
  next()
})

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
router.use("/ficha", fichaEstudianteRoutes) //listo
router.use("/contactos", contactos) //listo
router.use("/periodos-matricula", PeriodoMatricula) //listo
router.use("/procesos-inscripcion", procesoInscripcionRoutes) //listo
router.use("/director-grupo", directorGrupoRoutes)
router.use("/asignacion-docente", asignacionDocenteRoutes)
router.use("/reemplazos-profesor", reemplazoProfesorRoutes)
router.use("/decretos", decretoRoutes)
router.use("/grados-escalafon", gradoEscalafonRoutes)
router.use("/auditoria", auditoriaRoutes)

export default router
