class MainController < ApplicationController
  def home
    if current_user
      @exams = []
      current_user.registrations.each do |reg|
        @exams << reg.exam
      end
      render "dashboard"
    else
      redirect_to new_user_session_path
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
