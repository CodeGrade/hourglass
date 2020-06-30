# frozen_string_literal: true

class CreateSchema < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :username, null: false
      t.index :username, unique: true

      t.string :display_name, null: false
      t.integer :nuid
      t.string :email, null: false
      t.string :encrypted_password, null: false, default: ''
      t.string :unique_session_id
      t.string :image_url

      t.boolean :admin, null: false, default: false

      t.string :bottlenose_access_token
      t.string :bottlenose_refresh_token

      t.timestamps
    end

    create_table :courses do |t|
      t.string :title, null: false
      t.datetime :last_sync, null: true
      t.boolean :active, null: false, default: false

      t.integer :bottlenose_id, null: false

      t.timestamps
    end

    create_table :sections do |t|
      t.references :course, null: false, foreign_key: true

      t.string :title, null: false
      t.integer :bottlenose_id, null: false
      t.timestamps
    end

    create_table :professor_course_registrations do |t|
      t.references :course, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.index [:course_id, :user_id], unique: true
      t.index [:user_id, :course_id], unique: true
      t.timestamps
    end

    create_table :student_registrations do |t|
      t.references :section, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.index [:section_id, :user_id], unique: true
      t.index [:user_id, :section_id], unique: true

      t.timestamps
    end

    create_table :staff_registrations do |t|
      t.references :section, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.boolean :ta, null: false, default: false
      t.index [:section_id, :user_id], unique: true
      t.index [:user_id, :section_id], unique: true

      t.timestamps
    end

    create_table :exams do |t|
      t.references :course, null: false, foreign_key: true

      t.string :name, null: false
      t.integer :bottlenose_assignment_id

      t.integer :duration, null: false
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false

      t.timestamps
    end

    create_table :exam_versions do |t|
      t.string :name, null: false
      t.jsonb :files, null: false
      t.jsonb :info, null: false

      t.references :exam, null: false, foreign_key: true

      t.timestamps
    end

    create_table :rooms do |t|
      t.references :exam, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end

    create_table :registrations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :room, foreign_key: true
      t.references :exam_version, null: false, foreign_key: true
      t.index [:exam_version_id, :user_id], unique: true
      t.index [:user_id, :exam_version_id], unique: true
      t.index [:room_id, :user_id], unique: true
      t.index [:user_id, :room_id], unique: true

      t.jsonb :grades

      t.datetime :start_time
      t.datetime :end_time

      t.timestamps
    end

    create_table :accommodations do |t|
      t.references :registration, null: false, foreign_key: true, index: { unique: true }
      t.datetime :new_start_time
      t.integer :percent_time_expansion, null: false, default: 0

      t.timestamps
    end

    create_table :proctor_registrations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :exam, null: false, foreign_key: true
      t.references :room, foreign_key: true

      t.index [:exam_id, :user_id], unique: true
      t.index [:user_id, :exam_id], unique: true

      t.timestamps
    end

    create_table :anomalies do |t|
      t.references :registration, null: false, foreign_key: true
      t.string :reason, null: false, default: ''

      t.timestamps
    end

    create_table :exam_announcements do |t|
      t.references :exam, null: false, foreign_key: true
      t.text :body, null: false

      t.timestamps
    end

    create_table :version_announcements do |t|
      t.references :exam_version, null: false, foreign_key: true
      t.text :body, null: false

      t.timestamps
    end

    create_table :room_announcements do |t|
      t.references :room, null: false, foreign_key: true
      t.text :body, null: false

      t.timestamps
    end

    create_table :messages do |t|
      t.references :exam, null: false, foreign_key: true

      t.references :sender, null: false, foreign_key: { to_table: 'users' }
      t.references :recipient, null: false, foreign_key: { to_table: 'users' }

      t.index [:exam_id, :recipient_id]

      t.text :body, null: false
      t.timestamps
    end

    create_table :questions do |t|
      t.references :exam, null: false, foreign_key: true

      t.references :sender, null: false, foreign_key: { to_table: 'users' }

      t.text :body, null: false
      t.timestamps
    end

    create_table :snapshots do |t|
      t.references :registration, null: false, foreign_key: true
      t.jsonb :answers, null: false

      t.timestamps
    end

    create_table :grading_locks do |t|
      t.references :registration, null: false, foreign_key: true
      t.references :grader, null: false, foreign_key: { to_table: 'users' }

      t.integer :qnum, null: false
      t.integer :pnum, null: false

      t.index [:registration_id, :qnum, :pnum], unique: true

      t.timestamps
    end
  end
end
