class ApplicationController < ActionController::Base
  protect_from_forgery

  rescue_from DoubleLoginException do |e|
    redirect_to root_path, alert: 'You are currently logged into another session.'
  end

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || super
  end

  def find_exam(id = params[:exam_id])
    return unless @exam.nil?

    @exam ||= Exam.find(id)
    if @exam.nil?
      redirect_back fallback_location :root_path, alert: 'No such exam.'
    end
  end

  def require_current_user_registration
    return unless @registration.nil?

    find_exam

    @registration ||= Registration.find_by(user: current_user, exam: @exam)
    if @registration.nil?
      redirect_back fallback_location: root_path, alert: 'You are not registered for that exam.'
    end
  end

  def require_current_user_registration_proctor
    find_exam
    require_current_user_registration

    return if @registration.professor?

    unless @registration&.proctor?
      redirect_back fallback_location :root_path, alert: 'You are not registered to proctor that exam.'
    end
  end

  def require_exam_enabled
    unless @exam&.enabled?
      redirect_back fallback_location: root_path, alert: 'This exam has not been enabled yet.'
    end
  end

  def require_current_user
    if current_user.nil?
      store_user_location! if storable_location?
      redirect_to new_user_session_path, alert: 'You need to log in first.'
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

  def bottlenose_token
    @bottlenose_token ||=
      if current_user
        OAuth2::AccessToken.new(
          bottlenose_oauth_client, current_user.bottlenose_access_token
        )
      end
  end

  def require_current_user_professor_for_course(course_id = params[:exam][:course_id])
    unless current_user_professor_for_course(course_id)
      redirect_to root_path, alert: 'Must be a registered professor for the course.'
    end
  end

  def current_user_professor_for_course(course_id)
    return true if current_user&.admin?

    # course_id needs to be a number
    course_num = course_id.to_i
    course =
      begin
        bottlenose_token.get("/api/courses/#{course_num}").parsed
      rescue StandardError
        return false
      end
    course['role'] == 'professor'
  end

  private

  def bottlenose_oauth_client
    @bottlenose_oauth_client ||= OAuth2::Client.new(
      ENV.fetch("BOTTLENOSE_APP_ID"),
      ENV.fetch("BOTTLENOSE_APP_SECRET"),
      site: ENV.fetch("BOTTLENOSE_URL")
    )
  end

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
