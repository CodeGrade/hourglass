# frozen_string_literal: true

class MainController < ApplicationController
  def home
    if current_user
      redirect_to exams_path
    else
      redirect_to new_user_session_path
    end
  end
end
