require 'json'

class Submission < ApplicationRecord
  belongs_to :user
  belongs_to :exam

  before_destroy :purge!

  def purge!
    FileUtils.rm_f file_name
    if Dir.empty? user_subs
      FileUtils.rm_rf user_subs
    end
    if Dir.empty? exam_subs
      FileUtils.rm_rf exam_subs
    end
  end

  def self.base_sub_dir
    Rails.root.join("private", "submissions", Rails.env)
  end

  def exam_subs
    Submission.base_sub_dir.join(exam.id.to_i.to_s)
  end

  def user_subs
    exam_subs.join(user.id.to_i.to_s)
  end

  def save_answers(answers)
    ts = Time.now.strftime('%Y-%m-%d_%H-%M-%S')
    rand = SecureRandom.urlsafe_base64
    self.file_name = user_subs.join "#{ts}_#{rand}"
    fcontents = JSON.dump(answers)
    FileUtils.mkdir_p user_subs
    File.write(self.file_name, fcontents)
  end
end
