# frozen_string_literal: true

# Base class for all application  controllers
class ApplicationController < ActionController::Base
  protect_from_forgery

  def verified_request?
      if request.content_type == "application/json"
        true
      else
        super()
      end
  end

  impersonates :user

  rescue_from DoubleLoginException do |_e|
    redirect_to root_path,
                alert: 'You are currently logged into another session.'
  end

  def bottlenose_api
    @bottlenose_api = Bottlenose::API.new(current_user)
  end
end
