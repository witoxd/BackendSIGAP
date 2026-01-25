import { Request, Response } from "express";
import { PersonaCreationAttributes } from "../models/sequelize/Persona";
import { CreatePersonaDTO, UpdatePersonaDTO } from "../types";
type CreationPersonaStaticRequest = Request<never, unknown, CreatePersonaDTO>;
export declare class PersonaController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    getByDocumento(req: Request, res: Response): Promise<void>;
    searchByDocumento(req: Request, res: Response): Promise<void>;
    SearchIndex(req: Request, res: Response): Promise<void>;
    static createPersona(data: Omit<PersonaCreationAttributes, "persona_id">): Promise<any>;
    create(req: CreationPersonaStaticRequest, res: Response): Promise<void>;
    update(req: Request<{
        id: string;
    }, unknown, UpdatePersonaDTO>, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=persona.controller.d.ts.map