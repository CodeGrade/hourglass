# frozen_string_literal: true

module Api
  module Grader
    # Student registration controls.
    class RegistrationsController < GraderController
      before_action :find_registration_and_exam_and_course
      before_action :require_staff_reg

      def show
        version = @registration.exam_version
        render json: {
          user: {
            id: @registration.user.id,
            displayName: @registration.user.display_name,
          },
          contents: {
            exam: {
              questions: version.contents['questions'],
              reference: version.contents['reference'],
              instructions: version.contents['instructions'],
              files: version.files,
            },
            answers: @registration.current_answers,
          },
        }
      end
    end
  end
end
