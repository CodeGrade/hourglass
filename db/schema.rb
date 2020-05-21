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

ActiveRecord::Schema.define(version: 2020_05_14_210728) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "anomalies", force: :cascade do |t|
    t.integer "registration_id", null: false
    t.string "reason", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "exam_messages", force: :cascade do |t|
    t.integer "exam_id", null: false
    t.integer "sender_id", null: false
    t.integer "recipient_id"
    t.text "body", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "exams", force: :cascade do |t|
    t.boolean "enabled", default: false, null: false
    t.string "name", null: false
    t.integer "course_id", null: false
    t.integer "assignment_id"
    t.jsonb "files", null: false
    t.jsonb "info", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "registrations", force: :cascade do |t|
    t.integer "exam_id", null: false
    t.integer "user_id", null: false
    t.integer "room_id", null: false
    t.integer "role", default: 0, null: false
    t.boolean "final", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rooms", force: :cascade do |t|
    t.integer "exam_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "snapshots", force: :cascade do |t|
    t.integer "registration_id", null: false
    t.jsonb "answers", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "display_name", null: false
    t.integer "nuid"
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "role", default: 0, null: false
    t.string "unique_session_id"
    t.string "image_url"
    t.string "bottlenose_access_token"
    t.string "bottlenose_refresh_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end

end
