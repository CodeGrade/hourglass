class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :ldap_authenticatable, :database_authenticatable, :registerable,
         :rememberable, :validatable
  has_many :submissions
  has_many :registrations
  has_many :exams, through: :registrations
end
