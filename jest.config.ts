import type { Config } from "jest"

const config: Config = {
  // Usa ts-jest para que Jest entienda TypeScript directamente
  preset: "ts-jest",

  // Entorno Node (no browser)
  testEnvironment: "node",

  // Dónde buscar tests
  roots: ["<rootDir>/src"],

  // Patrón de archivos de test
  testMatch: ["**/__tests__/**/*.test.ts"],

  // Alias de imports (si usas paths en tsconfig, añadirlos aquí también)
  moduleNameMapper: {},

  // Variables de entorno para tests — sobreescribe el .env real
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],

  // Muestra cada test individualmente en la salida
  verbose: true,

  // Cobertura de código (activar con: jest --coverage)
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/seeders/**",
    "!src/server.ts",
  ],
}

export default config
