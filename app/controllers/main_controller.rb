# frozen_string_literal: true

# Entry point for sign-in / React app.
class MainController < ApplicationController
  def index
    return redirect_to new_user_session_path unless current_user

    render component: '', prerender: false
  end
end
