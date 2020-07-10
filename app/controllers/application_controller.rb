# frozen_string_literal: true

class ApplicationController < ActionController::Base
  protect_from_forgery

  impersonates :user

  rescue_from DoubleLoginException do |_e|
    redirect_to root_path,
                alert: 'You are currently logged into another session.'
  end

  def bottlenose_api
    @bottlenose_api = Bottlenose::API.new(current_user)
  end
end
