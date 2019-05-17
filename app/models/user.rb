class User < ApplicationRecord
  devise :ldap_authenticatable, :database_authenticatable, :rememberable
  has_many :submissions
  has_many :registrations
  has_many :exams, through: :registrations
end
