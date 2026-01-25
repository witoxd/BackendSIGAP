"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Domain validators using Sequelize Model.build().validate()
__exportStar(require("./administrativo.domain"), exports);
__exportStar(require("./estudiante.domain"), exports);
__exportStar(require("./profesor.domain"), exports);
__exportStar(require("./curso.domain"), exports);
__exportStar(require("./matricula.domain"), exports);
__exportStar(require("./acudiente.domain"), exports);
__exportStar(require("./egresado.domain"), exports);
__exportStar(require("./sede.domain"), exports);
__exportStar(require("./jornada.domain"), exports);
__exportStar(require("./tipoDocumento.domain"), exports);
__exportStar(require("./archivo.domain"), exports);
__exportStar(require("./permiso.domain"), exports);
__exportStar(require("./persona.domain"), exports);
__exportStar(require("./usuario.domain"), exports);
__exportStar(require("./role.domain"), exports);
//# sourceMappingURL=index.js.map