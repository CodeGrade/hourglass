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
              newStartTime: acc.new_start_time,
              percentTimeExpansion: acc.percent_time_expansion,
              registration: {
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
        accommodation_params = params.require(:accommodation).permit(:newStartTime, :percentTimeExpansion)
        @accommodation.update!(
          new_start_time: accommodation_params[:newStartTime],
          percent_time_expansion: accommodation_params[:percentTimeExpansion],
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
