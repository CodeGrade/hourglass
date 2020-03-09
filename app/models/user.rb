# frozen_string_literal: true

class User < ApplicationRecord
  devise :ldap_authenticatable, :database_authenticatable, :rememberable, :session_limitable
  has_many :registrations
  has_many :exams, through: :registrations

  enum role: { unprivileged: 0, professor: 1, admin: 2 }

  def admin_or_prof?
    admin? || professor?
  end
end
