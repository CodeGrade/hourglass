class ApplicationController < ActionController::Base
  rescue_from DeviseLdapAuthenticatable::LdapException, Net::LDAP::Error do |exception|
    redirect_back fallback_location: root_path, alert: "There was an error logging in. Please contact a professor or site admin, and provide them the following information:<br>#{exception}"
  end
  protect_from_forgery
end
