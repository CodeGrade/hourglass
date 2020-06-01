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
      t.index [:section_id, :user_id], unique: true
      t.index [:user_id, :section_id], unique: true

      t.timestamps
    end

    create_table :exams do |t|
      t.references :course, null: false, foreign_key: true

      t.string :name, null: false
      t.boolean :enabled, null: false, default: false

      t.jsonb :files, null: false
      t.jsonb :info, null: false

      t.integer :bottlenose_assignment_id

      t.timestamps
    end

    create_table :rooms do |t|
      t.references :exam, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end

    create_table :registrations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :room, null: false, foreign_key: true
      t.index [:room_id, :user_id], unique: true
      t.index [:user_id, :room_id], unique: true

      t.boolean :final, null: false, default: false

      t.timestamps
    end

    create_table :proctor_registrations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :room, null: false, foreign_key: true
      t.index [:room_id, :user_id], unique: true
      t.index [:user_id, :room_id], unique: true

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
  end
end
