# frozen_string_literal: true

module Api
  module Grader
    # Grader staff registrations.
    class StaffRegistrationsController < GraderController
      def index
        staff_regs = StaffRegistration.where(user: current_user)
        render json: {
          regs: staff_regs.map do |reg|
            {
              id: reg.id,
              course: {
                id: reg.course.id,
                exams: reg.course.exams.map do |exam|
                  {
                    id: exam.id,
                    name: exam.name,
                  }
                end,
              },
            }
          end,
        }
      end
    end
  end
end
