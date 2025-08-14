-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "localidad" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "telefono1" TEXT NOT NULL,
    "telefono2" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tipoEmpresa" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "notificaciones" BOOLEAN NOT NULL DEFAULT false,
    "contraseña" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "vin" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "nroMotor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "año" INTEGER NOT NULL,
    "nroCertificado" TEXT NOT NULL,
    "venta" DATETIME,
    "fechaImportacion" DATETIME NOT NULL,
    "patente" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ContactoRepuesto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreEncargado" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "telefono1" TEXT NOT NULL,
    "telefono2" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Repuesto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaDeCarga" DATETIME NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "precioVenta" REAL NOT NULL,
    "contactoId" INTEGER NOT NULL,
    CONSTRAINT "Repuesto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Repuesto_contactoId_fkey" FOREIGN KEY ("contactoId") REFERENCES "ContactoRepuesto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Garantia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaActivacion" DATETIME NOT NULL,
    "vehiculoVin" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Garantia_vehiculoVin_fkey" FOREIGN KEY ("vehiculoVin") REFERENCES "Vehiculo" ("vin") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Garantia_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Garantia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Orden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaCreacion" DATETIME NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "vehiculoVin" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "estadoInterno" TEXT NOT NULL,
    "kilometrajeReal" INTEGER NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "observacionesAdicionales" TEXT NOT NULL,
    "tareas" TEXT NOT NULL,
    "cantHoras" INTEGER NOT NULL,
    "repuestos" TEXT NOT NULL,
    "DescripRepuesto" TEXT NOT NULL,
    "fotoPatenteUrl" TEXT NOT NULL,
    "fotoChapaVinUrl" TEXT NOT NULL,
    "fotoCuentaKilometrosUrl" TEXT NOT NULL,
    "fotoPiezasAdicionalesUrl" TEXT NOT NULL,
    "fotoFirmadaClienteUrl" TEXT NOT NULL,
    "fotoORUrl" TEXT NOT NULL,
    CONSTRAINT "Orden_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_vehiculoVin_fkey" FOREIGN KEY ("vehiculoVin") REFERENCES "Vehiculo" ("vin") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_vin_key" ON "Vehiculo"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_nroCertificado_key" ON "Vehiculo"("nroCertificado");

-- CreateIndex
CREATE UNIQUE INDEX "Repuesto_codigo_key" ON "Repuesto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Garantia_vehiculoVin_key" ON "Garantia"("vehiculoVin");
