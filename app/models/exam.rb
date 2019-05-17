class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :submissions
  has_one :upload

  validates_presence_of :upload

  def questions
    return @questions if @questions
    @questions = YAML.load(File.read(upload.file_name))
  end
end
