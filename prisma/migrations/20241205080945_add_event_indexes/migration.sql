-- CreateIndex
CREATE INDEX "events_date_idx" ON "public"."events"("date");

-- CreateIndex
CREATE INDEX "events_is_featured_idx" ON "public"."events"("is_featured");

-- CreateIndex
CREATE INDEX "events_category_id_idx" ON "public"."events"("category_id");

-- CreateIndex
CREATE INDEX "events_organizer_id_idx" ON "public"."events"("organizer_id");

-- CreateIndex
CREATE INDEX "events_name_idx" ON "public"."events"("name");
