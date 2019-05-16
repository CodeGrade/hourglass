class MainController < ApplicationController
  def home
    if current_user
      render "dashboard"
    else
      render "landing"
    end
  end

  def resource_name
    :user
  end
  helper_method :resource_name

  def resource
    @resource ||= User.new
  end
  helper_method :resource

  def devise_mapping
    @devise_mapping ||= Devise.mappings[:user]
  end
  helper_method :devise_mapping
end
