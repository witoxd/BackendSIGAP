"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const AppError_1 = require("../utils/AppError");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.type === "field" ? err.path : "unknown",
            message: err.msg,
        }));
        return next(new AppError_1.ValidationError("Errores de validación", formattedErrors));
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map