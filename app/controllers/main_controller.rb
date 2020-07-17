# frozen_string_literal: true

# Entry point for sign-in / React app.
class MainController < ApplicationController
  def index
    return redirect_to new_user_session_path unless current_user

    binding.pry
    render component: 'workflows', prerender: false, class: 'h-100 d-flex flex-column'
  end
end
