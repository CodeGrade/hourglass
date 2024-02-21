# frozen_string_literal: true

# Entry point for sign-in / React app.
class MainController < ApplicationController
  def index
    unless current_user
      store_user_location! if storable_location?
      return redirect_to new_user_session_path
    end

    render component: 'workflows', prerender: false, class: 'h-100 d-flex flex-column'
  end

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || super
  end

  private

  # Its important that the location is NOT stored if:
  # - The request method is not GET (non idempotent)
  # - The request is handled by a Devise controller such as Devise::SessionsController as that could cause an
  #    infinite redirect loop.
  # - The request is an Ajax request as this can lead to very unexpected behaviour.
  def storable_location?
    request.get? && is_navigational_format? && !devise_controller? && !request.xhr?
  end

  def store_user_location!
    # :user is the scope we are authenticating
    store_location_for(:user, request.fullpath)
  end
end
