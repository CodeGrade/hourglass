class ApplicationController < ActionController::Base
  protect_from_forgery

  rescue_from DoubleLoginException do |_e|
    redirect_to root_path,
                alert: 'You are currently logged into another session.'
  end

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || super
  end

  # TODO: all of the find_ methods will be API helpers

  def find_exam(id = params[:exam_id])
    @exam ||= @course&.exams&.find_by(id: id)
    return unless @exam.nil?

    redirect_back fallback_location: root_path, alert: 'No such exam.'
  end

  def find_section(id = params[:section_id])
    @section ||= @course&.sections&.find_by(id: id)
    return unless @section.nil?

    redirect_back fallback_location: root_path, alert: 'No such section.'
  end

  def find_room(id = params[:room_id])
    @room ||= @exam&.rooms&.find_by(id: id)
    return unless @room.nil?

    redirect_back fallback_location: root_path, alert: 'No such room.'
  end

  def find_course(id = params[:course_id])
    @course ||= Course.find_by(id: id)
    return unless @course.nil?

    redirect_back fallback_location: root_path, alert: 'No such course.'
  end

  # def require_proctor_reg
  #   @proctor_registration ||= ProctorRegistration.find_by(
  #     user: current_user,
  #     exam: @exam
  #   )
  #   return unless @proctor_registration.nil?

  #   redirect_back fallback_location: root_path,
  #                 alert: 'You are not registered to proctor that exam.'
  # end

  def require_student_reg
    @registration ||= Registration.find_by(
      user: current_user,
      room: @exam.rooms
    )
    return unless @registration.nil?

    redirect_back fallback_location: root_path,
                  alert: 'You are not registered to take that exam.'
  end

  def find_registration(id = params[:registration_id])
    @registration ||= @room&.registrations&.find_by(id: id)

    if @registration.nil?
      redirect_back fallback_location: root_path,
                    alert: 'You are not registered to take that exam.'
    end

    if @registration.user != current_user
      redirect_back fallback_location: root_path, alert: 'You do not have permission for that registration.'
    end
  end

  def find_anomaly(id = params[:anomaly_id])
    @anomaly ||= @registration&.anomalies&.find_by(id: id)
    return unless @anomaly.nil?
  end


  def student_reg
    @registration ||= Registration.where(
      user: current_user,
      exam: @exam
    )
    return unless @professor_course_registration.nil?

    redirect_to root_path,
                alert: 'You are not registered to take that exam.'
  end

  def require_exam_enabled
    return if @exam&.enabled?

    redirect_back fallback_location: root_path,
                  alert: 'That exam is not enabled.'
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
    require_current_user
    return if current_user&.admin?

    redirect_to root_path, alert: 'Must be an admin.'
  end

  module Bottlenose
    class ApiError < RuntimeError
      def initialize
        super 'Bottlenose API error. Please report to a professor or site admin.'
      end
    end

    class ConnectionFailed < RuntimeError
      def initialize()
        super 'Error contacting Bottlenose. Please report to a professor or site admin.'
      end
    end
  end

  def bottlenose_get(*args)
    bottlenose_token.get(*args).parsed
  rescue OAuth2::Error
    raise Bottlenose::ApiError
  rescue Faraday::ConnectionFailed
    raise Bottlenose::ConnectionFailed
  end

  def bottlenose_token
    @bottlenose_token ||=
      if current_user
        OAuth2::AccessToken.new(
          bottlenose_oauth_client, current_user.bottlenose_access_token
        )
      end
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
