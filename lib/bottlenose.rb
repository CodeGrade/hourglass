# frozen_string_literal: true

module Bottlenose
  # Connects with the Bottlenose server to synchronize course information
  class API
    def initialize(user)
      @user = user
    end

    def sync_courses
      terms = bottlenose_get('/api/courses')
      terms.each do |term|
        active_courses = term['courses']
        active_courses.each do |active_course|
          next unless active_course['prof']

          hg_course = Course.find_or_initialize_by(bottlenose_id: active_course['id'])
          hg_course.title = active_course['name']
          hg_course.last_sync = DateTime.now
          hg_course.active = true
          hg_course.save!
        end
      end
    end

    def sync_course_regs(course)
      got = bottlenose_get("/api/courses/#{course.bottlenose_id}/registrations")
      got.each do |sec_id, sec_obj|
        sec = course.sections.find_or_initialize_by(bottlenose_id: sec_id)
        sec.title = sec_obj['title']
        sec.save!
        sec_obj['students'].each do |student|
          user = sync_user(student)
          reg = sec.student_registrations.find_or_initialize_by(user: user)
          reg.save!
        end
        sec_obj['graders'].each do |grader|
          user = sync_user(grader)
          reg = sec.staff_registrations.find_or_initialize_by(user: user)
          reg.save!
        end
        sec_obj['assistants'].each do |ta|
          user = sync_user(ta)
          reg = sec.staff_registrations.find_or_initialize_by(user: user)
          reg.ta = true
          reg.save!
        end
        sec_obj['professors'].each do |prof|
          user = sync_user(prof)
          reg = course.professor_course_registrations.find_or_initialize_by(user: user)
          reg.save!
        end
      end
    end

    def create_exam(exam)
      res = bottlenose_post(
        "/api/courses/#{exam.course.bottlenose_id}/assignments/create_or_update",
        headers: {
          'Content-Type' => 'application/json',
        },
        body: exam.bottlenose_export.to_json,
      )
      exam.update(bottlenose_assignment_id: res['id'])
    end

    private

    def sync_user(raw_user)
      user = User.where(username: raw_user['username']).first_or_initialize
      user.display_name = raw_user['display_name']
      user.nuid = raw_user['nuid']
      user.email = raw_user['email']
      user.image_url = raw_user['image_url']
      user.save!
      user
    end

    def bottlenose_send(method, *args)
      bottlenose_token.send(method, *args).parsed
    rescue OAuth2::Error => e
      case e.response.status
      when 401
        raise Bottlenose::UnauthorizedError
      else
        raise Bottlenose::ApiError
      end
    rescue Faraday::ConnectionFailed
      raise Bottlenose::ConnectionFailed
    end

    def bottlenose_post(*args)
      bottlenose_send(:post, *args)
    end

    def bottlenose_get(*args)
      bottlenose_send(:get, *args)
    end

    def bottlenose_oauth_client
      @bottlenose_oauth_client ||= OAuth2::Client.new(
        ENV.fetch('BOTTLENOSE_APP_ID'),
        ENV.fetch('BOTTLENOSE_APP_SECRET'),
        site: ENV.fetch('BOTTLENOSE_URL'),
      )
    end

    def bottlenose_token
      @bottlenose_token ||=
        if @user
          OAuth2::AccessToken.new(
            bottlenose_oauth_client, @user.bottlenose_access_token
          )
        end
    end
  end

  # 401 calling Bottlenose API.
  class UnauthorizedError < RuntimeError
    def initialize
      super '401 unauthorized when attempting to contact Bottlenose. Please log out and back in.'
    end
  end

  # Error calling Bottlenose API.
  class ApiError < RuntimeError
    def initialize
      super 'Bottlenose API error. Please report to a professor or site admin.'
    end
  end

  # Connection to Bottlenose failed.
  class ConnectionFailed < RuntimeError
    def initialize
      super 'Error contacting Bottlenose. Please report to a professor or site admin.'
    end
  end
end
