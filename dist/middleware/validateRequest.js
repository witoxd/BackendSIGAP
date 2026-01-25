"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = require("../utils/AppError");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => ({
            field: error.type === "field" ? error.path : "unknown",
            message: error.msg,
        }));
        throw new AppError_1.AppError("Errores de validación", 400, errorMessages);
    }
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map