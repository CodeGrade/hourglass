require 'json'

class Submission < ApplicationRecord
  belongs_to :user
  belongs_to :exam

  after_rollback :purge!

  def purge!
    FileUtils.rm_f filename
    if Dir.empty? exam_subs
      FileUtils.rm_rf exam_subs
    end
  end

  def self.base_sub_dir
    Rails.root.join("private", "submissions", Rails.env)
  end

  # [[ts, answers_hash], ...]
  def get_answers
    JSON.parse(File.read(filename))
  end

  def save_answers(answers)
    unless File.exist? filename
      FileUtils.mkdir_p exam_subs
      write_json([])
    end
    json = get_answers
    ts = DateTime.now.strftime('%s')
    json.push [ts, answers]
    write_json(json)
  end

  private
  def exam_subs
    Submission.base_sub_dir.join(exam.id.to_i.to_s)
  end

  private
  def filename
    exam_subs.join("user#{user.id.to_i.to_s}.json")
  end

  private
  def write_json(json)
    File.write(filename, JSON.dump(json))
  end
end
