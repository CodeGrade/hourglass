class ApplicationController < ActionController::Base
  rescue_from DeviseLdapAuthenticatable::LdapException, Net::LDAP::Error do |exception|
    redirect_back fallback_location: root_path, alert: "There was an error logging in. Please contact a professor or site admin, and provide them the following information:<br>#{exception}"
  end
  protect_from_forgery

  def require_current_user
    if current_user.nil?
      redirect_to root_path(next: request.fullpath), alert: "You need to log in first."
      return
    end
  end

  def current_user_site_admin?
    current_user&.role == "admin"
  end

  def current_user_prof?
    current_user&.role >= User::roles["professor"]
  end

  def require_admin(fallback_path = nil)
    fallback_path ||= root_path
    unless current_user_site_admin?
      redirect_back fallback_location: fallback_path, alert: "Must be an admin."
      return
    end
  end

  def require_admin_or_prof(fallback_path = nil)
    fallback_path ||= root_path
    unless current_user_site_admin? || current_user_prof?
      redirect_back fallback_location: fallback_path, alert: "Must be an admin or professor."
      return
    end
  end
end
