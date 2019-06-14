class ApplicationController < ActionController::Base
  rescue_from DeviseLdapAuthenticatable::LdapException, Net::LDAP::Error do |exception|
    redirect_back fallback_location: root_path, alert: "There was an error logging in. Please contact a professor or site admin, and provide them the following information:<br>#{exception}"
  end
  protect_from_forgery

  def after_sign_in_path_for(resource)
    params[:next] || super
  end

  def require_current_user
    if current_user.nil?
      redirect_to new_user_session_path(next: request.fullpath), alert: "You need to log in first."
      return false
    end
    true
  end

  def require_admin
    return unless require_current_user
    unless current_user&.admin?
      redirect_to root_path, alert: "Must be an admin."
      return
    end
  end

  def require_admin_or_prof
    return unless require_current_user
    unless current_user&.admin_or_prof?
      redirect_to root_path, alert: "Must be an admin or professor."
      return
    end
  end
end
