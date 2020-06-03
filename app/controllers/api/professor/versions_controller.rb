# frozen_string_literal: true

module Api
  module Professor
    class VersionsController < ProfessorController
      before_action :find_exam_and_course
      before_action :require_prof_reg

      def index
        version_regs = @exam.registrations.group_by(&:exam_version)
        render json: {
          versions: @exam.exam_versions.map do |version|
            regs = version_regs[version] || []
            serialize_version_regs version, regs
          end,
          sections: @exam.course.sections.map do |section|
            {
              id: section.id,
              title: section.title,
              students: section.registered_students_for(@exam).map do |student|
                serialize_student student
              end
            }
          end
        }
      end

      def create
        # TODO move from exams#create
      end

      def update_all
        body = params.permit(versions: {})
        body[:versions].each do |version_id, student_ids|
          student_ids.each do |id|
            student_reg = @exam.registrations.find_or_initialize_by(user_id: id)
            student_reg.exam_version_id = version_id
            student_reg.save!
          end
        end
        render json: {
          created: true
        }
      rescue StandardError => e
        render json: {
          created: false,
          reason: e.message
        }
      end

      private

      def serialize_student(user)
        {
          id: user.id,
          displayName: user.display_name,
          username: user.username
        }
      end

      def serialize_version_regs(version, regs)
        {
          id: version.id,
          name: version.name,
          students: regs.map(&:user).map do |s|
            serialize_student s
          end
        }
      end
    end
  end
end

