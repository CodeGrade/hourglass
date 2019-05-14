class User < ApplicationRecord
  has_many :submissions
  has_many :registrations
  has_many :exams, through: :registrations
end
