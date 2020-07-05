# frozen_string_literal: true

module Api
  module Professor
    class ExamsController < ProfessorController
      before_action :find_exam_and_course, only: [:show]
      before_action :find_course
      before_action :require_prof_reg

      def show
        render json: {
          name: @exam.name,
          start: @exam.start_time,
          end: @exam.end_time,
          duration: @exam.duration,
          versions: @exam.exam_versions.includes(:registrations).map {|v| serialize_version(v) },
          checklist: @exam.checklist,
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
              files: version.files,
            },
            answers: {
              answers: version.answers,
            },
          },
          anyStarted: version.any_started?,
        }
      end
    end
  end
end
