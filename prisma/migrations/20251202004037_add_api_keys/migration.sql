-- CreateTable
CREATE TABLE "ApiPlatform" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ApiPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "loginMethod" TEXT,
    "apiKey" TEXT NOT NULL,
    "creditTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "referralLink" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiPlatform_userId_idx" ON "ApiPlatform"("userId");

-- CreateIndex
CREATE INDEX "ApiPlatform_deletedAt_idx" ON "ApiPlatform"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiPlatform_userId_slug_key" ON "ApiPlatform"("userId", "slug");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_platformId_idx" ON "ApiKey"("platformId");

-- CreateIndex
CREATE INDEX "ApiKey_deletedAt_idx" ON "ApiKey"("deletedAt");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "ApiPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
