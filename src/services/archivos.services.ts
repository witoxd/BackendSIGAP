import { deleteFile } from "../config/multer";

export class archivoService {

    static async deleteFileArray(files: Express.Multer.File[]) {
        try {
            await Promise.all(files.map(file => deleteFile(file.path)))
        } catch (error) {
            console.error("Error limpiado archivos: ", error)
        }
    }



}