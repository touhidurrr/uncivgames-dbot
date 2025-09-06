-- CreateTable
CREATE TABLE "Variable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiscordPoll" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "authorId" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DiscordPollEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "pollId" BIGINT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscordPollEntry_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "DiscordPoll" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordPollVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    "discordId" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscordPollVote_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DiscordPollEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Variable_id_key" ON "Variable"("id");

-- CreateIndex
CREATE INDEX "Variable_createdAt_idx" ON "Variable"("createdAt");

-- CreateIndex
CREATE INDEX "Variable_updatedAt_idx" ON "Variable"("updatedAt");

-- CreateIndex
CREATE INDEX "DiscordPoll_createdAt_idx" ON "DiscordPoll"("createdAt");

-- CreateIndex
CREATE INDEX "DiscordPollEntry_createdAt_idx" ON "DiscordPollEntry"("createdAt");

-- CreateIndex
CREATE INDEX "DiscordPollEntry_updatedAt_idx" ON "DiscordPollEntry"("updatedAt");

-- CreateIndex
CREATE INDEX "DiscordPollVote_createdAt_idx" ON "DiscordPollVote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordPollVote_entryId_discordId_key" ON "DiscordPollVote"("entryId", "discordId");
