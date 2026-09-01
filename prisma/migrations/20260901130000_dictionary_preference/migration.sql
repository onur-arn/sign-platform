-- CreateTable
CREATE TABLE "DictionaryPreference" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "signId" TEXT NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictionaryPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryPreference_lang_normalized_key" ON "DictionaryPreference"("lang", "normalized");

-- CreateIndex
CREATE INDEX "DictionaryPreference_lang_idx" ON "DictionaryPreference"("lang");
