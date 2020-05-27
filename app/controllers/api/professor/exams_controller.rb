# frozen_string_literal: true

module Api
  module Professor
    class ExamsController < ProfessorController
      before_action :find_course
      before_action :require_prof_reg

      def create
        exam_params = params.permit(:name, :file)
        file = exam_params[:file]
        upload = Upload.new(file)
        Audit.log("Uploaded file #{file.original_filename} for #{current_user.username} (#{current_user.id})")
        @exam = Exam.new(
          name: exam_params[:name],
          course: @course,
          info: upload.info,
          files: upload.files
        )
        @exam.save!
        Room.create!(
          exam: @exam,
          name: 'Exam Room'
        )
        head :created
      end
    end
  end
end
