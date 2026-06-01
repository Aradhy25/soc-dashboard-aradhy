-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ip" TEXT,
    "os" TEXT,
    "status" TEXT NOT NULL DEFAULT 'online',
    "lastSeenAt" DATETIME,
    "processes" JSONB,
    "apiKeyHash" TEXT NOT NULL,
    "apiKeyPrefix" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sourceIp" TEXT,
    "destinationIp" TEXT,
    "rawData" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Log_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT,
    "timestamp" DATETIME NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "sourceIp" TEXT,
    "affectedSystem" TEXT,
    "attackType" TEXT NOT NULL,
    "mitreId" TEXT,
    "rawLogs" TEXT NOT NULL,
    "country" TEXT,
    "lat" REAL,
    "lng" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "rootCause" TEXT NOT NULL,
    "affectedSystems" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ThreatItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "firstSeen" DATETIME NOT NULL,
    "lastSeen" DATETIME NOT NULL,
    "reputation" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ObservedUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "lastLogin" DATETIME,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "devices" JSONB,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NetworkSample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT,
    "timestamp" DATETIME NOT NULL,
    "inbound" INTEGER NOT NULL,
    "outbound" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NetworkSample_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NetworkConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT,
    "timestamp" DATETIME NOT NULL,
    "srcIp" TEXT NOT NULL,
    "dstIp" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NetworkConnection_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
