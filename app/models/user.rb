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

  has_many :sent_messages,
           foreign_key: 'sender',
           class_name: 'Message',
           dependent: :destroy,
           inverse_of: 'sender'

  has_many :received_messages,
           foreign_key: 'recipient',
           class_name: 'Message',
           dependent: :destroy,
           inverse_of: 'recipient'

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
      bottlenose_refresh_token: auth.credentials.refresh_token
    )
  end

  def reg_for(exam)
    registrations.find_by(room: exam.rooms)
  end
end
