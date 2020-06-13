# frozen_string_literal: true

module Api
  module Professor
    class ExamsController < ProfessorController
      before_action :find_exam_and_course, only: [:show, :update]
      before_action :find_course
      before_action :require_prof_reg

      def update
        body = params.require(:exam).permit(:name, :start, :end, :duration)
        # TODO update start and end, add policies
        updated = @exam.update(
          {
            name: body[:name],
            duration: body[:duration]
          }
        )
        render json: {
          updated: updated
        }
      end

      def index
        render json: {
          exams: @course.exams.each do |exam|
            exam.slice(:id, :name)
          end
        }
      end

      def show
        render json: {
          name: @exam.name,
          start: @exam.start_time,
          end: @exam.end_time,
          duration: @exam.duration,
          versions: @exam.exam_versions.map {|v| serialize_version(v) }
        }
      end

      private

      def serialize_version(version)
        {
          id: version.id,
          name: version.name,
          policies: version.policies,
          contents: {
            exam: {
              questions: version.contents['questions'],
              reference: version.contents['reference'],
              instructions: version.contents['instructions'],
              files: version.files
            },
            answers: {
              answers: version.answers
            }
          },
          anyStarted: version.any_started?
        }
      end
    end
  end
end
