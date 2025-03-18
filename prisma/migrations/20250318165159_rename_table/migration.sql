/*
  Warnings:

  - You are about to drop the column `elimination_poll_id` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `elimination_poll_id` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the `elimination_polls` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `poll_id` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_elimination_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_elimination_poll_id_fkey";

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "elimination_poll_id",
ADD COLUMN     "poll_id" TEXT;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "elimination_poll_id",
ADD COLUMN     "poll_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "elimination_polls";

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
