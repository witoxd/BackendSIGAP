import { Pool } from "pg";
import { Sequelize } from "sequelize";
export declare const FORCE_DATABASE_SYNC: boolean;
export declare const pool: Pool;
export declare const sequelize: Sequelize;
export declare const query: (text: string, params?: any[], client?: any) => Promise<any>;
export declare const transaction: (callback: (client: any) => Promise<any>) => Promise<any>;
export declare const testConnection: () => Promise<boolean>;
export declare const closeConnections: () => Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map