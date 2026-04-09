"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const acl_1 = require("../middleware/acl");
const contacto_controller_1 = require("../controllers/contacto.controller");
const contacto_validators_1 = require("../validators/contacto.validators");
const contacto_domain_1 = require("../validators/domain/contacto.domain");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const contactoController = new contacto_controller_1.ContactoController();
router.use(auth_1.authenticate);
// Obtener todos los contactos
router.get("/getAll", (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.READ), contactoController.getAll.bind(contactoController));
// Obtener contacto por ID
router.get("/getById/:id", contacto_validators_1.contactoIdValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.READ), contactoController.getById.bind(contactoController));
// Obtener contactos por persona
router.get("/getByPersona/:personaId", contacto_validators_1.personaIdValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.READ), contactoController.getByPersonaId.bind(contactoController));
// Obtener contactos por tipo
router.get("/getByTipo/:personaId", contacto_validators_1.personaIdValidator, contacto_validators_1.searchContactoValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.READ), contactoController.getByTipo.bind(contactoController));
// Crear contacto
router.post("/create", contacto_validators_1.createContactoHttpValidator, validate_1.validate, contacto_domain_1.validateCreateContactoDomain, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.CREATE), contactoController.create.bind(contactoController));
// Crear múltiples contactos
router.post("/bulkCreate", contacto_validators_1.bulkCreateContactoHttpValidator, validate_1.validate, contacto_domain_1.validateBulkCreateContactoDomain, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.CREATE), contactoController.bulkCreate.bind(contactoController));
// Actualizar contacto
router.put("/update/:id", contacto_validators_1.contactoIdValidator, contacto_validators_1.updateContactoHttpValidator, validate_1.validate, contacto_domain_1.validateUpdateContactoDomain, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.UPDATE), contactoController.update.bind(contactoController));
// Establecer como principal
router.patch("/setPrincipal/:id", contacto_validators_1.contactoIdValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.UPDATE), contactoController.setPrincipal.bind(contactoController));
// Eliminar contacto
router.delete("/delete/:id", contacto_validators_1.contactoIdValidator, validate_1.validate, (0, acl_1.checkPermission)(types_1.Recurso.PERSONAS, types_1.Accion.DELETE), contactoController.delete.bind(contactoController));
exports.default = router;
//# sourceMappingURL=contacto.routes.js.map