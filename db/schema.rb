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

ActiveRecord::Schema.define(version: 2020_05_22_182009) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accommodations", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.datetime "new_start_time", null: false
    t.integer "percent_time_expansion", default: 0, null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_accommodations_on_registration_id"
  end

  create_table "anomalies", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.string "reason", default: "", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_anomalies_on_registration_id"
  end

  create_table "courses", force: :cascade do |t|
    t.string "title", null: false
    t.datetime "last_sync"
    t.boolean "active", default: false, null: false
    t.integer "bottlenose_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "exam_versions", force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "files", null: false
    t.jsonb "info", null: false
    t.bigint "exam_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
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

  create_table "messages", force: :cascade do |t|
    t.bigint "exam_id", null: false
    t.bigint "sender_id", null: false
    t.bigint "recipient_id", null: false
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id", "recipient_id"], name: "index_messages_on_exam_id_and_recipient_id"
    t.index ["exam_id"], name: "index_messages_on_exam_id"
    t.index ["recipient_id"], name: "index_messages_on_recipient_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "proctor_registrations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "room_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["room_id", "user_id"], name: "index_proctor_registrations_on_room_id_and_user_id", unique: true
    t.index ["room_id"], name: "index_proctor_registrations_on_room_id"
    t.index ["user_id", "room_id"], name: "index_proctor_registrations_on_user_id_and_room_id", unique: true
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
    t.bigint "exam_id", null: false
    t.bigint "sender_id", null: false
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_id"], name: "index_questions_on_exam_id"
    t.index ["sender_id"], name: "index_questions_on_sender_id"
  end

  create_table "registrations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "room_id", null: false
    t.bigint "exam_version_id", null: false
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["exam_version_id"], name: "index_registrations_on_exam_version_id"
    t.index ["room_id", "user_id"], name: "index_registrations_on_room_id_and_user_id", unique: true
    t.index ["room_id"], name: "index_registrations_on_room_id"
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

  create_table "sections", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.string "title", null: false
    t.integer "bottlenose_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
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
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["section_id", "user_id"], name: "index_staff_registrations_on_section_id_and_user_id", unique: true
    t.index ["section_id"], name: "index_staff_registrations_on_section_id"
    t.index ["user_id", "section_id"], name: "index_staff_registrations_on_user_id_and_section_id", unique: true
    t.index ["user_id"], name: "index_staff_registrations_on_user_id"
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
  add_foreign_key "exam_versions", "exams"
  add_foreign_key "exams", "courses"
  add_foreign_key "messages", "exams"
  add_foreign_key "messages", "users", column: "recipient_id"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "proctor_registrations", "rooms"
  add_foreign_key "proctor_registrations", "users"
  add_foreign_key "professor_course_registrations", "courses"
  add_foreign_key "professor_course_registrations", "users"
  add_foreign_key "questions", "exams"
  add_foreign_key "questions", "users", column: "sender_id"
  add_foreign_key "registrations", "exam_versions"
  add_foreign_key "registrations", "rooms"
  add_foreign_key "registrations", "users"
  add_foreign_key "room_announcements", "rooms"
  add_foreign_key "rooms", "exams"
  add_foreign_key "sections", "courses"
  add_foreign_key "snapshots", "registrations"
  add_foreign_key "staff_registrations", "sections"
  add_foreign_key "staff_registrations", "users"
  add_foreign_key "student_registrations", "sections"
  add_foreign_key "student_registrations", "users"
  add_foreign_key "version_announcements", "exam_versions"
end
