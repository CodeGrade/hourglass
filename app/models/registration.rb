class Registration < ApplicationRecord
  belongs_to :user
  belongs_to :exam
  belongs_to :room

  has_many :anomalies

  enum role: [:student, :proctor, :professor, :admin]

  after_create :create_file
  after_commit :purge_file!, on: :destroy

  def anomalous?
    anomalies.size > 0
  end

  def allow_submission?
    !(self.final? || self.anomalous?)
  end

  def create_file
    FileUtils.mkdir_p exam_subs
    open(filename, 'w') do |f|
      f.puts '"initial": {}'
    end
  end

  def purge_file!
    FileUtils.rm_f filename
    if Dir.empty? exam_subs
      FileUtils.rm_rf exam_subs
    end
  end

  def self.base_sub_dir
    Rails.root.join("private", "submissions", Rails.env)
  end

  def get_all_answers
    JSON.parse("{" + File.read(filename) + "}")
  end

  def get_current_answers
    get_all_answers.values.last
  end

  def save_answers(answers)
    json = get_current_answers
    return if json == answers
    append_json(answers)
  end

  private
  def exam_subs
    Registration.base_sub_dir.join(exam.id.to_i.to_s)
  end

  private
  def filename
    exam_subs.join("user#{user.id.to_i}.json")
  end

  private
  def append_json(json)
    ts = DateTime.now.iso8601
    open(filename, 'a') do |f|
      f.puts ", \"#{ts}\": " + JSON.dump(json)
    end
  end
end
