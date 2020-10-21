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
          sync_course_regs(hg_course)
        end
      end
    end

    def sync_course_regs(course)
      got = bottlenose_get("/api/courses/#{course.bottlenose_id}/registrations")
      all_usernames = got.map do |_sec_id, sec_obj|
        sec_obj.map do |role, users|
          if role == 'title'
            []
          else
            users.map { |u| u['username'] }
          end
        end
      end.flatten
      all_users = User.where(username: all_usernames).index_by(&:username)
      # rubocop:disable  Metrics/BlockLength
      User.transaction do
        sections = course.sections.index_by(&:bottlenose_id)
        prof_regs = course.professor_course_registrations.includes(:user).index_by(&:user_id)
        got.each do |sec_id, sec_obj|
          sec = sections[sec_id.to_i] || Section.new(course_id: course.id, bottlenose_id: sec_id)
          sec.title = sec_obj['title']
          sec.save!
          student_regs = sec.student_registrations.includes(:user).index_by(&:user_id)
          sec_obj['students'].each do |student|
            user = sync_user(student, all_users)
            reg = student_regs[user.id] || StudentRegistration.new(section: sec, user: user)
            reg.save!
          end
          staff_regs = sec.staff_registrations.includes(:user).index_by(&:user_id)
          sec_obj['graders'].each do |grader|
            user = sync_user(grader, all_users)
            reg = staff_regs[user.id] || StaffRegistration.new(section: sec, user: user)
            reg.ta = false
            reg.save!
          end
          sec_obj['assistants'].each do |ta|
            user = sync_user(ta, all_users)
            reg = staff_regs[user.id] || StaffRegistration.new(section: sec, user: user)
            reg.ta = true
            reg.save!
          end
          sec_obj['professors'].each do |prof|
            user = sync_user(prof, all_users)
            reg = prog_regs[user.id] || ProfessorCourseRegistration.new(course: course, user: user)
            reg.save!
          end
        end
      end
      # rubocop:enable  Metrics/BlockLength
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

    def sync_user(raw_user, all_users)
      user = all_users[raw_user['username']] || User.new(username: raw_user['username]'])
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
