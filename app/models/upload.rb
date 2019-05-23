class Upload < ApplicationRecord
  belongs_to :user
  belongs_to :exam

  after_initialize :generate_secret_key!

  def self.base_upload_dir
    Rails.root.join("private", "uploads", Rails.env)
  end

  def upload_dir
    pre = secret_key.slice(0, 2)
    Upload.base_upload_dir.join(user&.id.to_i.to_s, exam&.id.to_i.to_s, pre, secret_key)
  end

  def generate_secret_key!
    return unless new_record?

    unless secret_key.nil?
      raise Exception.new("Can't generate a second secret key for an upload.")
    end

    self.secret_key = SecureRandom.urlsafe_base64

    if Dir.exist?(upload_dir)
      raise Exception.new("Duplicate secret key (2). That's unpossible!")
    end
  end
end
