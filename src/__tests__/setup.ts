// Este archivo se ejecuta ANTES de cada suite de tests.
// Configura variables de entorno para que el código no intente
// conectarse a la base de datos real durante los tests.

process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test-secret-key-para-tests"
process.env.DB_HOST = "localhost"
process.env.DB_PORT = "5432"
process.env.DB_NAME = "sigap_test"
process.env.DB_USER = "postgres"
process.env.DB_PASSWORD = "postgres"
