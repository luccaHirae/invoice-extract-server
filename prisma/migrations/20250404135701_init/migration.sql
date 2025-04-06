-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "clientNumber" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "electricEnergyKwh" INTEGER,
    "electricEnergyR" DOUBLE PRECISION,
    "energySCEEKwh" INTEGER,
    "energySCEER" DOUBLE PRECISION,
    "energyCompensationKwh" INTEGER,
    "energyCompensationR" DOUBLE PRECISION,
    "publicLightingR" DOUBLE PRECISION,
    "totalR" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
