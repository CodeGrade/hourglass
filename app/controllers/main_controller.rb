# frozen_string_literal: true

# Entry point for sign-in / React app.
class MainController < ApplicationController
  def index
    return redirect_to new_user_session_path unless current_user

    bottlenose_api.sync_courses
    render component: 'workflows', prerender: false
  end
end
