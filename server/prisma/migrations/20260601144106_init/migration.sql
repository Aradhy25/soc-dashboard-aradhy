-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('online', 'offline', 'isolated');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('info', 'warning', 'error', 'critical');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('open', 'investigating', 'resolved');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('open', 'investigating', 'contained', 'resolved');

-- CreateEnum
CREATE TYPE "ThreatType" AS ENUM ('ip', 'hash', 'domain');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('normal', 'suspicious');

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT,
    "os" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'online',
    "lastSeenAt" TIMESTAMP(3),
    "processes" JSONB,
    "apiKeyHash" TEXT NOT NULL,
    "apiKeyPrefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" "LogSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "sourceIp" TEXT,
    "destinationIp" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'open',
    "sourceIp" TEXT,
    "affectedSystem" TEXT,
    "attackType" TEXT NOT NULL,
    "mitreId" TEXT,
    "rawLogs" TEXT NOT NULL,
    "country" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'open',
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "rootCause" TEXT NOT NULL,
    "affectedSystems" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatItem" (
    "id" TEXT NOT NULL,
    "type" "ThreatType" NOT NULL,
    "value" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "reputation" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "lastLogin" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "devices" JSONB,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkSample" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "inbound" INTEGER NOT NULL,
    "outbound" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkConnection" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "srcIp" TEXT NOT NULL,
    "dstIp" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_apiKeyHash_key" ON "Device"("apiKeyHash");

-- CreateIndex
CREATE INDEX "Log_deviceId_timestamp_idx" ON "Log"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "Log_severity_timestamp_idx" ON "Log"("severity", "timestamp");

-- CreateIndex
CREATE INDEX "Alert_status_severity_timestamp_idx" ON "Alert"("status", "severity", "timestamp");

-- CreateIndex
CREATE INDEX "Alert_attackType_timestamp_idx" ON "Alert"("attackType", "timestamp");

-- CreateIndex
CREATE INDEX "Alert_country_timestamp_idx" ON "Alert"("country", "timestamp");

-- CreateIndex
CREATE INDEX "ThreatItem_type_value_idx" ON "ThreatItem"("type", "value");

-- CreateIndex
CREATE INDEX "ObservedUser_username_idx" ON "ObservedUser"("username");

-- CreateIndex
CREATE INDEX "NetworkSample_timestamp_idx" ON "NetworkSample"("timestamp");

-- CreateIndex
CREATE INDEX "NetworkConnection_timestamp_idx" ON "NetworkConnection"("timestamp");

-- CreateIndex
CREATE INDEX "NetworkConnection_status_timestamp_idx" ON "NetworkConnection"("status", "timestamp");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkSample" ADD CONSTRAINT "NetworkSample_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkConnection" ADD CONSTRAINT "NetworkConnection_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
