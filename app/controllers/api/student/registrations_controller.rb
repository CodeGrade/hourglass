# frozen_string_literal: true

module Api
  module Student
    # Student exam registrations.
    class RegistrationsController < StudentController
      def index
        student_regs = Registration.where(user: current_user)
        render json: {
          regs: student_regs.map do |reg|
            reg.slice(:id)
          end,
          regInfo: student_regs.map do |reg|
            [reg.id, {
              exam: reg.exam.slice(:id, :name),
              course: reg.course.slice(:id),
            }]
          end.to_h,
        }
        # TODO: put this in proctor/regs#index
        # proctor_regs = ProctorRegistration.where(user: current_user)
        # render json: {
        #   regs: {
        #     proctor: proctor_regs.map do |reg|
        #       reg.slice(:id)
        #     end
        #   },
        #   regInfo: proctor_regs.map do |reg|
        #     [reg.id, {
        #       exam: reg.exam.slice(:id, :name),
        #       course: reg.course.slice(:id)
        #     }]
        #   end.to_h
        # }
      end
    end
  end
end
