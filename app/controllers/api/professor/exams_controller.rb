# frozen_string_literal: true

module Api
  module Professor
    class ExamsController < ProfessorController
      before_action :find_exam_and_course, only: [:show]
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
        render json: { id: @exam.id }, status: :created
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
            answers: version.answers
          }
        }
      end
    end
  end
end
