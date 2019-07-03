# frozen_string_literal: true

class DoubleLoginException < StandardError
  attr_accessor :user

  def initialize(msg, user: nil)
    super(msg)
    @user = user
  end
end

# After each sign in, update unique_session_id. This is only triggered when the
# user is explicitly set (with set_user) and on authentication. Retrieving the
# user from session (:fetch) does not trigger it.
Warden::Manager.after_set_user except: :fetch do |record, warden, options|
  if record.respond_to?(:update_unique_session_id!) && warden.authenticated?(options[:scope])
    unique_session_id = Devise.friendly_token
    warden.session(options[:scope])['unique_session_id'] = unique_session_id
    record.update_unique_session_id!(unique_session_id)
  end
end

# Each time a record is fetched from session we check if a new session from
# another browser was opened for the record or not, based on a unique session
# identifier. If so, the old account is logged out and redirected to the sign in
# page on the next request.
Warden::Manager.after_set_user only: :fetch do |record, warden, options|
  scope = options[:scope]
  env   = warden.request.env

  if record.respond_to?(:unique_session_id) && warden.authenticated?(scope) && options[:store] != false
    if record.unique_session_id != warden.session(scope)['unique_session_id'] && !env['devise.skip_session_limitable']
      Rails.logger.warn { 
        "[devise-security][session_limitable] session id mismatch: "\
        "expected=#{record.unique_session_id.inspect} "\
        "actual=#{warden.session(scope)['unique_session_id'].inspect}" 
      }
      warden.raw_session.clear
      warden.logout(scope)
      raise DoubleLoginException.new("User #{record.username} attempted to login twice.", user: record)
    end
  end
end

module Devise
  module Models
    # SessionLimited ensures, that there is only one session usable per account at once.
    # If someone logs in, and some other is logging in with the same credentials,
    # the session from the first one is invalidated and not usable anymore.
    # The first one is redirected to the sign page with a message, telling that
    # someone used his credentials to sign in.
    module SessionLimitable
      extend ActiveSupport::Concern

      # Update the unique_session_id on the model.  This will be checked in
      # the Warden after_set_user hook in {file:devise-security/hooks/session_limitable}
      # @param unique_session_id [String]
      # @return [void]
      # @raise [Devise::Models::Compatibility::NotPersistedError] if record is unsaved
      def update_unique_session_id!(unique_session_id)
        update_column(:unique_session_id, unique_session_id).tap do
          Rails.logger.debug { "[devise-security][session_limitable] unique_session_id=#{unique_session_id}"}
        end
      end

    end
  end
end
