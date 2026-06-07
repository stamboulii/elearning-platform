-- CreateTable
CREATE TABLE "study_schedules" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "target_date" TIMESTAMP(3) NOT NULL,
    "hours_per_day" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "schedule_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_schedules_enrollment_id_key" ON "study_schedules"("enrollment_id");

-- AddForeignKey
ALTER TABLE "study_schedules" ADD CONSTRAINT "study_schedules_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
