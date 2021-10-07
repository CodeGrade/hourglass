# frozen_string_literal: true

module Users
  # Controller to support logging in via OAuth through Bottlenose
  class OmniauthCallbacksController < Devise::OmniauthCallbacksController
    def bottlenose
      @user = User.from_omniauth(request.env['omniauth.auth'])

      if @user.persisted?
        @user.update_bottlenose_credentials(request.env['omniauth.auth'])
        sign_in_and_redirect @user, event: :authentication
        set_flash_message(:notice, :success, kind: 'Bottlenose') if is_navigational_format?
        bottlenose_api.sync_courses
      else
        session['devise.bottlenose_data'] = request.env['omniauth.auth']
        redirect_to new_user_registration_url
      end
    end

    def failure
      timestamp = Time.current.to_s
      error_msg = 'Unexpected error logging in with Bottlenose.'
      error_msg += '<br>'
      error_msg += 'Please contact a professor or admin, with a screenshot of this message.'
      error_msg += '<br>'
      error_msg += "<span class=\"small\">#{timestamp}</span>"
      redirect_to root_path, flash: { error: error_msg }
    end
  end
end
