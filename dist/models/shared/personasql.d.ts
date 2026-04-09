export declare const PERSONA_FIELDS_SQL: string;
export declare const PERSONA_FIELDS_JSON: string;
export declare const personaJoin: (tableAlias: string) => string;
export declare const buildUpdateQuery: (tableName: string, primaryKey: string, id: number, data: Record<string, any>, excludeKeys?: string[]) => {
    sql: string;
    values: any[];
} | null;
export declare const buildUpsertQuery: (tableName: string, conflictKey: string, conflictValue: number, data: Record<string, any>) => {
    sql: string;
    values: any[];
} | null;
//# sourceMappingURL=personasql.d.ts.map