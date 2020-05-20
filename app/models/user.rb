class User < ApplicationRecord
  devise :omniauthable, :database_authenticatable, :session_limitable, omniauth_providers: [:bottlenose]

  has_many :registrations
  has_many :exams, through: :registrations

  def self.from_omniauth(auth)
    user = where(username: auth.uid).first_or_initialize
    user.display_name = auth.info.display_name
    user.nuid = auth.info.nuid
    user.email = auth.info.email
    unless user.admin?
      user.role =
        if auth.info.prof
          roles[:professor]
        else
          roles[:unprivileged]
        end
    end
    user.image_url = auth.info.image_url
    user.save!
    user
  end

  def update_bottlenose_credentials(auth)
    update(
      bottlenose_access_token: auth.credentials.token,
      bottlenose_refresh_token: auth.credentials.refresh_token
    )
  end

  # professors can create exams
  enum role: [:unprivileged, :professor, :admin]

  def admin_or_prof?
    self.admin? || self.professor?
  end

  def reg_for(exam)
    registrations.find_by(exam: exam)
  end
end
