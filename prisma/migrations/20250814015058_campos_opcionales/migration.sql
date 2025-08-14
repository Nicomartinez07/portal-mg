-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactoRepuesto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreEncargado" TEXT NOT NULL,
    "direccion" TEXT,
    "provincia" TEXT,
    "localidad" TEXT,
    "telefono1" TEXT,
    "telefono2" TEXT,
    "email" TEXT
);
INSERT INTO "new_ContactoRepuesto" ("direccion", "email", "id", "localidad", "nombreEncargado", "provincia", "telefono1", "telefono2") SELECT "direccion", "email", "id", "localidad", "nombreEncargado", "provincia", "telefono1", "telefono2" FROM "ContactoRepuesto";
DROP TABLE "ContactoRepuesto";
ALTER TABLE "new_ContactoRepuesto" RENAME TO "ContactoRepuesto";
CREATE TABLE "new_Empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "localidad" TEXT,
    "telefono1" TEXT,
    "telefono2" TEXT,
    "email" TEXT,
    "tipoEmpresa" TEXT NOT NULL
);
INSERT INTO "new_Empresa" ("direccion", "email", "id", "localidad", "nombre", "provincia", "telefono1", "telefono2", "tipoEmpresa") SELECT "direccion", "email", "id", "localidad", "nombre", "provincia", "telefono1", "telefono2", "tipoEmpresa" FROM "Empresa";
DROP TABLE "Empresa";
ALTER TABLE "new_Empresa" RENAME TO "Empresa";
CREATE TABLE "new_Orden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaCreacion" DATETIME NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "vehiculoVin" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "estadoInterno" TEXT,
    "kilometrajeReal" INTEGER NOT NULL,
    "diagnostico" TEXT,
    "observacionesAdicionales" TEXT,
    "tareas" TEXT NOT NULL,
    "cantHoras" INTEGER NOT NULL,
    "repuestos" TEXT NOT NULL,
    "DescripRepuesto" TEXT,
    "fotoPatenteUrl" TEXT,
    "fotoChapaVinUrl" TEXT,
    "fotoCuentaKilometrosUrl" TEXT,
    "fotoPiezasAdicionalesUrl" TEXT,
    "fotoFirmadaClienteUrl" TEXT,
    "fotoORUrl" TEXT,
    CONSTRAINT "Orden_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_vehiculoVin_fkey" FOREIGN KEY ("vehiculoVin") REFERENCES "Vehiculo" ("vin") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Orden" ("DescripRepuesto", "cantHoras", "clienteId", "diagnostico", "empresaId", "estado", "estadoInterno", "fechaCreacion", "fotoChapaVinUrl", "fotoCuentaKilometrosUrl", "fotoFirmadaClienteUrl", "fotoORUrl", "fotoPatenteUrl", "fotoPiezasAdicionalesUrl", "id", "kilometrajeReal", "observacionesAdicionales", "repuestos", "tareas", "usuarioId", "vehiculoVin") SELECT "DescripRepuesto", "cantHoras", "clienteId", "diagnostico", "empresaId", "estado", "estadoInterno", "fechaCreacion", "fotoChapaVinUrl", "fotoCuentaKilometrosUrl", "fotoFirmadaClienteUrl", "fotoORUrl", "fotoPatenteUrl", "fotoPiezasAdicionalesUrl", "id", "kilometrajeReal", "observacionesAdicionales", "repuestos", "tareas", "usuarioId", "vehiculoVin" FROM "Orden";
DROP TABLE "Orden";
ALTER TABLE "new_Orden" RENAME TO "Orden";
CREATE TABLE "new_Repuesto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaDeCarga" DATETIME,
    "empresaId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "modelo" TEXT,
    "stock" INTEGER,
    "precioVenta" REAL,
    "contactoId" INTEGER NOT NULL,
    CONSTRAINT "Repuesto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Repuesto_contactoId_fkey" FOREIGN KEY ("contactoId") REFERENCES "ContactoRepuesto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Repuesto" ("codigo", "contactoId", "descripcion", "empresaId", "fechaDeCarga", "id", "modelo", "precioVenta", "stock") SELECT "codigo", "contactoId", "descripcion", "empresaId", "fechaDeCarga", "id", "modelo", "precioVenta", "stock" FROM "Repuesto";
DROP TABLE "Repuesto";
ALTER TABLE "new_Repuesto" RENAME TO "Repuesto";
CREATE UNIQUE INDEX "Repuesto_codigo_key" ON "Repuesto"("codigo");
CREATE TABLE "new_Vehiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "vin" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "nroMotor" TEXT,
    "tipo" TEXT,
    "año" INTEGER,
    "nroCertificado" TEXT NOT NULL,
    "venta" DATETIME,
    "fechaImportacion" DATETIME,
    "patente" TEXT NOT NULL
);
INSERT INTO "new_Vehiculo" ("año", "fecha", "fechaImportacion", "id", "marca", "modelo", "nroCertificado", "nroMotor", "patente", "tipo", "venta", "vin") SELECT "año", "fecha", "fechaImportacion", "id", "marca", "modelo", "nroCertificado", "nroMotor", "patente", "tipo", "venta", "vin" FROM "Vehiculo";
DROP TABLE "Vehiculo";
ALTER TABLE "new_Vehiculo" RENAME TO "Vehiculo";
CREATE UNIQUE INDEX "Vehiculo_vin_key" ON "Vehiculo"("vin");
CREATE UNIQUE INDEX "Vehiculo_nroCertificado_key" ON "Vehiculo"("nroCertificado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
