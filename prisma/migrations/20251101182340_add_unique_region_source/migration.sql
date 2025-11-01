-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "region" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "buy_price" DECIMAL(65,30) NOT NULL,
    "sell_price" DECIMAL(65,30) NOT NULL,
    "spread" DECIMAL(65,30),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_region_source_key" ON "Quote"("region", "source");
