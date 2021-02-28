# frozen_string_literal: true

module ApplicationCable
  # Main connection class for communicating with front end
  class Connection < ActionCable::Connection::Base
    identified_by :current_user, :true_user
    impersonates :user

    def connect
      self.current_user = find_verified_user
      reject_unauthorized_connection unless current_user
    end

    private

    def find_verified_user
      if Rails.env.development?
        return env['warden'].user if env['warden'].user

        user_num = rand(300)
        return User.find_by(username: "stresstest#{user_num}")
      end
      env['warden'].user
    end
  end
end
