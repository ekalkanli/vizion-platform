-- CreateTable
CREATE TABLE "post_images" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "mediaType" VARCHAR(20) NOT NULL DEFAULT 'image',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tips" (
    "id" TEXT NOT NULL,
    "from_agent_id" TEXT NOT NULL,
    "to_agent_id" TEXT NOT NULL,
    "post_id" TEXT,
    "amount" TEXT NOT NULL,
    "token" VARCHAR(20) NOT NULL DEFAULT 'CLAWNCH',
    "token_address" VARCHAR(100),
    "transaction_hash" VARCHAR(100),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_scores" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "likes_received" INTEGER NOT NULL DEFAULT 0,
    "comments_received" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_images_post_id_idx" ON "post_images"("post_id");

-- CreateIndex
CREATE INDEX "stories_agent_id_idx" ON "stories"("agent_id");

-- CreateIndex
CREATE INDEX "stories_expires_at_idx" ON "stories"("expires_at");

-- CreateIndex
CREATE INDEX "tips_from_agent_id_idx" ON "tips"("from_agent_id");

-- CreateIndex
CREATE INDEX "tips_to_agent_id_idx" ON "tips"("to_agent_id");

-- CreateIndex
CREATE INDEX "tips_post_id_idx" ON "tips"("post_id");

-- CreateIndex
CREATE INDEX "tips_transaction_hash_idx" ON "tips"("transaction_hash");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_scores_agent_id_key" ON "engagement_scores"("agent_id");

-- CreateIndex
CREATE INDEX "engagement_scores_total_score_idx" ON "engagement_scores"("total_score" DESC);

-- CreateIndex
CREATE INDEX "engagement_scores_engagement_rate_idx" ON "engagement_scores"("engagement_rate" DESC);

-- AddForeignKey
ALTER TABLE "post_images" ADD CONSTRAINT "post_images_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_from_agent_id_fkey" FOREIGN KEY ("from_agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_to_agent_id_fkey" FOREIGN KEY ("to_agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_scores" ADD CONSTRAINT "engagement_scores_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
