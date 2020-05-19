class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def bottlenose
    @user = User.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted?
      @user.update_bottlenose_credentials(request.env["omniauth.auth"])
      sign_in_and_redirect @user, event: :authentication
      # set_flash_message(:notice, :success, kind: 'Bottlenose') if is_navigational_format?
    else
      session["devise.bottlenose_data"] = request.env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end

  def failure
    redirect_to root_path
  end
end
