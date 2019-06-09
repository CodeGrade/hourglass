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
end
