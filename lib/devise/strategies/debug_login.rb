# frozen_string_literal: true

# From https://insights.kyan.com/devise-authentication-strategies-a1a6b4e2b891
module Devise
  module Strategies
    # A Devise login mechanism to allow locally testing username/passwords, without LDAP
    class DebugLogin < Authenticatable
      def authenticate!
        user = User.find_by(username: params[:user][:username])
        if user &&
           params[:user][:password].present? &&
           Devise::Encryptor.compare(user.class, user.encrypted_password, params[:user][:password])
          success!(user)
        else
          fail('Did not recognize username/password') # rubocop:disable Style/SignalException
        end
      end

      def valid?
        params[:user] && params[:user][:username] && params[:user][:password]
      end
    end
  end
end
