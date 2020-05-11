class User < ApplicationRecord
  devise :ldap_authenticatable, :database_authenticatable, :rememberable, :session_limitable
  has_many :registrations
  has_many :exams, through: :registrations

  # professors can create exams
  enum role: [:unprivileged, :professor, :admin]

  def admin_or_prof?
    self.admin? || self.professor?
  end

  def reg_for(exam)
    registrations.find_by(exam: exam)
  end
end
