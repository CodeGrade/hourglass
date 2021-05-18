# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_05_18_175335) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accommodations", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.datetime "new_start_time"
    t.integer "percent_time_expansion", default: 0, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_accommodations_on_registration_id", unique: true
  end

  create_table "anomalies", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.string "reason", default: "", null: false
    t.boolean "forgiven", default: false, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_anomalies_on_registration_id"
  end

  create_table "body_items", force: :cascade do |t|
    t.jsonb "info", null: false
    t.jsonb "answer"
    t.bigint "part_id", null: false
    t.integer "index", null: false
    t.index ["index", "part_id"], name: "unique_body_item_per_part", unique: true
    t.index ["part_id"], name: "index_body_items_on_part_id"
  end

  create_table "courses", force: :cascade do |t|
    t.string "title", null: false
    t.datetime "last_sync"
    t.boolean "active", default: false, null: false
    t.integer "bottlenose_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "exam_announcements", force: :cascade do |t|
    t.bigint "exam_id", null: false
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id"], name: "index_exam_announcements_on_exam_id"
  end

  create_table "exam_versions", force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "files", null: false
    t.jsonb "info", null: false
    t.bigint "exam_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "instructions", default: "", null: false
    t.string "policies", default: "", null: false
    t.index ["exam_id"], name: "index_exam_versions_on_exam_id"
  end

  create_table "exams", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.string "name", null: false
    t.integer "bottlenose_assignment_id"
    t.integer "duration", null: false
    t.datetime "start_time", null: false
    t.datetime "end_time", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["course_id"], name: "index_exams_on_course_id"
  end

  create_table "grading_checks", force: :cascade do |t|
    t.bigint "creator_id", null: false
    t.bigint "registration_id", null: false
    t.float "points"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "question_id", null: false
    t.bigint "part_id", null: false
    t.bigint "body_item_id", null: false
    t.index ["body_item_id"], name: "index_grading_checks_on_body_item_id"
    t.index ["creator_id"], name: "index_grading_checks_on_creator_id"
    t.index ["part_id"], name: "index_grading_checks_on_part_id"
    t.index ["question_id", "part_id", "body_item_id"], name: "index_grading_checks_on_coords"
    t.index ["question_id", "part_id"], name: "index_grading_checks_on_question_id_and_part_id"
    t.index ["question_id"], name: "index_grading_checks_on_question_id"
    t.index ["registration_id", "question_id", "part_id", "body_item_id"], name: "unique_check_per_item", unique: true
    t.index ["registration_id"], name: "index_grading_checks_on_registration_id"
  end

  create_table "grading_comments", force: :cascade do |t|
    t.bigint "creator_id", null: false
    t.text "message", null: false
    t.bigint "registration_id", null: false
    t.bigint "preset_comment_id"
    t.float "points", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "question_id", null: false
    t.bigint "part_id", null: false
    t.bigint "body_item_id", null: false
    t.index ["body_item_id"], name: "index_grading_comments_on_body_item_id"
    t.index ["creator_id"], name: "index_grading_comments_on_creator_id"
    t.index ["part_id"], name: "index_grading_comments_on_part_id"
    t.index ["preset_comment_id"], name: "index_grading_comments_on_preset_comment_id"
    t.index ["question_id", "part_id", "body_item_id"], name: "index_grading_comments_on_coords"
    t.index ["question_id", "part_id"], name: "index_grading_comments_on_question_id_and_part_id"
    t.index ["question_id"], name: "index_grading_comments_on_question_id"
    t.index ["registration_id"], name: "index_grading_comments_on_registration_id"
  end

  create_table "grading_locks", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.bigint "grader_id"
    t.bigint "completed_by_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "question_id", null: false
    t.bigint "part_id", null: false
    t.index ["completed_by_id"], name: "index_grading_locks_on_completed_by_id"
    t.index ["grader_id"], name: "index_grading_locks_on_grader_id"
    t.index ["part_id"], name: "index_grading_locks_on_part_id"
    t.index ["question_id", "part_id"], name: "index_grading_locks_on_question_id_and_part_id"
    t.index ["question_id"], name: "index_grading_locks_on_question_id"
    t.index ["registration_id", "question_id", "part_id"], name: "index_grading_locks_on_registration_id_and_qnum_and_pnum", unique: true
    t.index ["registration_id"], name: "index_grading_locks_on_registration_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "sender_id", null: false
    t.bigint "registration_id", null: false
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_messages_on_registration_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "parts", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.float "points", null: false
    t.boolean "extra_credit", default: false, null: false
    t.bigint "question_id", null: false
    t.integer "index", null: false
    t.index ["index", "question_id"], name: "unique_part_index_per_question", unique: true
    t.index ["question_id"], name: "index_parts_on_question_id"
  end

  create_table "preset_comments", force: :cascade do |t|
    t.bigint "rubric_preset_id", null: false
    t.string "label"
    t.string "grader_hint", null: false
    t.string "student_feedback"
    t.float "points", null: false
    t.integer "order"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["rubric_preset_id"], name: "index_preset_comments_on_rubric_preset_id"
  end

  create_table "proctor_registrations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "exam_id", null: false
    t.bigint "room_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id", "user_id"], name: "index_proctor_registrations_on_exam_id_and_user_id", unique: true
    t.index ["exam_id"], name: "index_proctor_registrations_on_exam_id"
    t.index ["room_id"], name: "index_proctor_registrations_on_room_id"
    t.index ["user_id", "exam_id"], name: "index_proctor_registrations_on_user_id_and_exam_id", unique: true
    t.index ["user_id"], name: "index_proctor_registrations_on_user_id"
  end

  create_table "professor_course_registrations", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["course_id", "user_id"], name: "index_professor_course_registrations_on_course_id_and_user_id", unique: true
    t.index ["course_id"], name: "index_professor_course_registrations_on_course_id"
    t.index ["user_id", "course_id"], name: "index_professor_course_registrations_on_user_id_and_course_id", unique: true
    t.index ["user_id"], name: "index_professor_course_registrations_on_user_id"
  end

  create_table "questions", force: :cascade do |t|
    t.string "name"
    t.string "description"
    t.boolean "extra_credit", default: false, null: false
    t.boolean "separate_subparts", default: false, null: false
    t.bigint "exam_version_id", null: false
    t.integer "index", null: false
    t.index ["exam_version_id"], name: "index_questions_on_exam_version_id"
    t.index ["index", "exam_version_id"], name: "unique_question_index_per_exam", unique: true
  end

  create_table "references", force: :cascade do |t|
    t.string "path", null: false
    t.string "type", null: false
    t.bigint "exam_version_id", null: false
    t.bigint "question_id"
    t.bigint "part_id"
    t.integer "index", null: false
    t.index ["exam_version_id"], name: "index_references_on_exam_version_id"
    t.index ["index", "exam_version_id", "question_id", "part_id"], name: "unique_reference_index_per_part", unique: true
    t.index ["index", "exam_version_id", "question_id"], name: "unique_reference_index_per_question", unique: true, where: "(part_id IS NULL)"
    t.index ["index", "exam_version_id"], name: "unique_reference_index_per_exam", unique: true, where: "((question_id IS NULL) AND (part_id IS NULL))"
    t.index ["part_id"], name: "index_references_on_part_id"
    t.index ["question_id"], name: "index_references_on_question_id"
  end

  create_table "registrations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "room_id"
    t.bigint "exam_version_id", null: false
    t.boolean "published", default: false, null: false
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["end_time"], name: "index_registrations_on_end_time"
    t.index ["exam_version_id", "user_id"], name: "index_registrations_on_exam_version_id_and_user_id", unique: true
    t.index ["exam_version_id"], name: "index_registrations_on_exam_version_id"
    t.index ["room_id", "user_id"], name: "index_registrations_on_room_id_and_user_id", unique: true
    t.index ["room_id"], name: "index_registrations_on_room_id"
    t.index ["start_time"], name: "index_registrations_on_start_time"
    t.index ["user_id", "exam_version_id"], name: "index_registrations_on_user_id_and_exam_version_id", unique: true
    t.index ["user_id", "room_id"], name: "index_registrations_on_user_id_and_room_id", unique: true
    t.index ["user_id"], name: "index_registrations_on_user_id"
  end

  create_table "room_announcements", force: :cascade do |t|
    t.bigint "room_id", null: false
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["room_id"], name: "index_room_announcements_on_room_id"
  end

  create_table "rooms", force: :cascade do |t|
    t.bigint "exam_id", null: false
    t.string "name", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id"], name: "index_rooms_on_exam_id"
  end

  create_table "rubric_presets", force: :cascade do |t|
    t.bigint "rubric_id", null: false
    t.string "label"
    t.string "direction", null: false
    t.float "mercy"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["rubric_id"], name: "index_rubric_presets_on_rubric_id"
  end

  create_table "rubrics", force: :cascade do |t|
    t.bigint "exam_version_id", null: false
    t.bigint "parent_section_id"
    t.string "type", null: false
    t.string "description"
    t.float "points"
    t.integer "order"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "question_id"
    t.bigint "part_id"
    t.bigint "body_item_id"
    t.index ["body_item_id"], name: "index_rubrics_on_body_item_id"
    t.index ["exam_version_id", "order"], name: "unique_rubric_order_per_ev", unique: true, where: "((parent_section_id IS NOT NULL) AND (question_id IS NULL) AND (part_id IS NULL) AND (body_item_id IS NULL))"
    t.index ["exam_version_id", "question_id", "order"], name: "unique_rubric_order_per_question", unique: true, where: "((parent_section_id IS NOT NULL) AND (question_id IS NOT NULL) AND (part_id IS NULL) AND (body_item_id IS NULL))"
    t.index ["exam_version_id", "question_id", "part_id", "body_item_id", "order"], name: "unique_rubric_order_per_body_item", unique: true, where: "((parent_section_id IS NOT NULL) AND (question_id IS NOT NULL) AND (part_id IS NOT NULL) AND (body_item_id IS NOT NULL))"
    t.index ["exam_version_id", "question_id", "part_id", "body_item_id"], name: "unique_rubric_root_coords_body_items", unique: true, where: "((parent_section_id IS NULL) AND (question_id IS NOT NULL) AND (part_id IS NOT NULL) AND (body_item_id IS NOT NULL))"
    t.index ["exam_version_id", "question_id", "part_id", "order"], name: "unique_rubric_order_per_part", unique: true, where: "((parent_section_id IS NOT NULL) AND (question_id IS NOT NULL) AND (part_id IS NOT NULL) AND (body_item_id IS NULL))"
    t.index ["exam_version_id", "question_id", "part_id"], name: "unique_rubric_root_coords_parts", unique: true, where: "((parent_section_id IS NULL) AND (question_id IS NOT NULL) AND (part_id IS NOT NULL) AND (body_item_id IS NULL))"
    t.index ["exam_version_id", "question_id"], name: "unique_rubric_root_coords_questions", unique: true, where: "((parent_section_id IS NULL) AND (question_id IS NOT NULL) AND (part_id IS NULL) AND (body_item_id IS NULL))"
    t.index ["exam_version_id"], name: "index_rubrics_on_exam_version_id"
    t.index ["exam_version_id"], name: "unique_rubric_root_coords_ev", unique: true, where: "((parent_section_id IS NULL) AND (question_id IS NULL) AND (part_id IS NULL) AND (body_item_id IS NULL))"
    t.index ["parent_section_id"], name: "index_rubrics_on_parent_section_id"
    t.index ["part_id"], name: "index_rubrics_on_part_id"
    t.index ["question_id", "part_id", "body_item_id"], name: "index_rubrics_on_question_id_and_part_id_and_body_item_id"
    t.index ["question_id", "part_id"], name: "index_rubrics_on_question_id_and_part_id"
    t.index ["question_id"], name: "index_rubrics_on_question_id"
  end

  create_table "sections", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.string "title", null: false
    t.integer "bottlenose_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["bottlenose_id"], name: "index_sections_on_bottlenose_id", unique: true
    t.index ["course_id"], name: "index_sections_on_course_id"
  end

  create_table "snapshots", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.jsonb "answers", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_snapshots_on_registration_id"
  end

  create_table "staff_registrations", force: :cascade do |t|
    t.bigint "section_id", null: false
    t.bigint "user_id", null: false
    t.boolean "ta", default: false, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["section_id", "user_id"], name: "index_staff_registrations_on_section_id_and_user_id", unique: true
    t.index ["section_id"], name: "index_staff_registrations_on_section_id"
    t.index ["user_id", "section_id"], name: "index_staff_registrations_on_user_id_and_section_id", unique: true
    t.index ["user_id"], name: "index_staff_registrations_on_user_id"
  end

  create_table "student_questions", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_student_questions_on_registration_id"
  end

  create_table "student_registrations", force: :cascade do |t|
    t.bigint "section_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["section_id", "user_id"], name: "index_student_registrations_on_section_id_and_user_id", unique: true
    t.index ["section_id"], name: "index_student_registrations_on_section_id"
    t.index ["user_id", "section_id"], name: "index_student_registrations_on_user_id_and_section_id", unique: true
    t.index ["user_id"], name: "index_student_registrations_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "display_name", null: false
    t.integer "nuid"
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "unique_session_id"
    t.string "image_url"
    t.boolean "admin", default: false, null: false
    t.string "bottlenose_access_token"
    t.string "bottlenose_refresh_token"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "version_announcements", force: :cascade do |t|
    t.bigint "exam_version_id", null: false
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_version_id"], name: "index_version_announcements_on_exam_version_id"
  end

  add_foreign_key "accommodations", "registrations"
  add_foreign_key "anomalies", "registrations"
  add_foreign_key "exam_announcements", "exams"
  add_foreign_key "exam_versions", "exams"
  add_foreign_key "exams", "courses"
  add_foreign_key "grading_checks", "registrations"
  add_foreign_key "grading_checks", "users", column: "creator_id"
  add_foreign_key "grading_comments", "preset_comments"
  add_foreign_key "grading_comments", "registrations"
  add_foreign_key "grading_comments", "users", column: "creator_id"
  add_foreign_key "grading_locks", "registrations"
  add_foreign_key "grading_locks", "users", column: "completed_by_id"
  add_foreign_key "grading_locks", "users", column: "grader_id"
  add_foreign_key "messages", "registrations"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "preset_comments", "rubric_presets"
  add_foreign_key "proctor_registrations", "exams"
  add_foreign_key "proctor_registrations", "rooms"
  add_foreign_key "proctor_registrations", "users"
  add_foreign_key "professor_course_registrations", "courses"
  add_foreign_key "professor_course_registrations", "users"
  add_foreign_key "registrations", "exam_versions"
  add_foreign_key "registrations", "rooms"
  add_foreign_key "registrations", "users"
  add_foreign_key "room_announcements", "rooms"
  add_foreign_key "rooms", "exams"
  add_foreign_key "rubric_presets", "rubrics"
  add_foreign_key "rubrics", "exam_versions"
  add_foreign_key "rubrics", "rubrics", column: "parent_section_id"
  add_foreign_key "sections", "courses"
  add_foreign_key "snapshots", "registrations"
  add_foreign_key "staff_registrations", "sections"
  add_foreign_key "staff_registrations", "users"
  add_foreign_key "student_questions", "registrations"
  add_foreign_key "student_registrations", "sections"
  add_foreign_key "student_registrations", "users"
  add_foreign_key "version_announcements", "exam_versions"
end
