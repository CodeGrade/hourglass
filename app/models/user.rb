# frozen_string_literal: true

# An application user.
# Login in production happens only through Bottlenose.
class User < ApplicationRecord
  devise :omniauthable,
         :database_authenticatable,
         :session_limitable,
         omniauth_providers: [:bottlenose]

  validates :username, presence: true
  validates :display_name, presence: true
  validates :email, presence: true

  has_many :registrations, dependent: :destroy
  has_many :professor_course_registrations, dependent: :destroy
  has_many :student_registrations, dependent: :destroy
  has_many :staff_registrations, dependent: :destroy
  has_many :proctor_registrations, dependent: :destroy

  has_many :courses, through: :registrations
  has_many :messages, through: :registrations

  has_many :sent_messages,
           foreign_key: 'sender',
           class_name: 'Message',
           dependent: :destroy,
           inverse_of: 'sender'

  has_many :grading_locks,
           foreign_key: 'grader',
           class_name: 'GradingLock',
           dependent: :destroy,
           inverse_of: 'grader'

  has_many :completed_grading_locks,
           foreign_key: 'completed_by',
           class_name: 'GradingLock',
           dependent: :destroy,
           inverse_of: 'completed_by'

  has_many :grading_checks,
           foreign_key: 'creator',
           class_name: 'GradingCheck',
           dependent: :destroy,
           inverse_of: 'creator'

  has_many :grading_comments,
           foreign_key: 'creator',
           class_name: 'GradingComment',
           dependent: :destroy,
           inverse_of: 'creator'

  def self.from_omniauth(auth)
    user = where(username: auth.uid).first_or_initialize
    user.display_name = auth.info.display_name
    user.nuid = auth.info.nuid
    user.email = auth.info.email
    user.image_url = auth.info.image_url
    user.save!
    user
  end

  def update_bottlenose_credentials(auth)
    update(
      bottlenose_access_token: auth.credentials.token,
      bottlenose_refresh_token: auth.credentials.refresh_token,
    )
  end

  def reg_for(exam)
    registrations.find_by(room: exam.rooms)
  end

  def full_bottlenose_image_url
    return nil if image_url.nil?

    bn_url = ENV.fetch('BOTTLENOSE_URL')
    bn_url + image_url
  end
end
