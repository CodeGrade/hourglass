# frozen_string_literal: true

module Api
  module Professor
    # Accommodation controls for exams.
    class AccommodationsController < ProfessorController
      before_action :find_accommodation, only: [:update, :destroy]
      before_action :find_exam_and_course
      before_action :require_prof_reg

      def index
        render json: {
          accommodations: @exam.accommodations.map do |acc|
            reg = acc.registration
            user = reg.user
            {
              id: acc.id,
              startTime: acc.new_start_time,
              extraTime: acc.percent_time_expansion,
              reg: {
                id: reg.id,
                user: {
                  displayName: user.display_name,
                },
              },
            }.compact
          end,
        }
      end

      def update
        accommodation_params = params.require(:accommodation).permit(:startTime, :extraTime)
        @accommodation.update!(
          new_start_time: accommodation_params[:startTime],
          percent_time_expansion: accommodation_params[:extraTime],
        )
        render json: {
          success: true,
        }
      rescue StandardError => e
        render json: {
          success: false,
          reason: e.message,
        }
      end

      def create
        reg_id = params.require(:registrationId)
        @registration = @exam.registrations.find_by!(id: reg_id)
        @accommodation = Accommodation.new(
          registration: @registration,
        )
        @accommodation.save!
        render json: {
          success: true,
        }
      rescue StandardError => e
        render json: {
          success: false,
          reason: e.message,
        }
      end

      def destroy
        @accommodation.destroy!
        render json: {
          success: true,
        }
      rescue StandardError => e
        render json: {
          success: false,
          reason: e.message,
        }
      end
    end
  end
end
