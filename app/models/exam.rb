class Exam < ApplicationRecord
  has_many :registrations
  has_many :users, through: :registrations
  has_many :submissions
end
