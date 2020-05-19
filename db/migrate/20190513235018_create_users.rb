class CreateUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :users do |t|
      t.string :username, null: false
      t.string :display_name, null: false
      t.integer :nuid
      t.string :email, null: false
      t.string :encrypted_password, null: false, default: ''
      t.integer :role, null: false, default: 0
      t.string :unique_session_id
      t.string :image_url

      t.string :bottlenose_access_token
      t.string :bottlenose_refresh_token

      t.index ['username'], name: 'index_users_on_username', unique: true
      t.timestamps
    end
  end
end
