# frozen_string_literal: true

module Api
  module Professor
    class ExamsController < ProfessorController
      before_action :find_exam_and_course, only: [:show, :update]
      before_action :find_course
      before_action :require_prof_reg

      def create
        exam_params = params.require(:exam).permit(:name, :duration, :start, :end)
        @exam = Exam.new(
          name: exam_params[:name],
          course: @course,
          start_time: DateTime.parse(exam_params[:start]),
          end_time: DateTime.parse(exam_params[:end]),
          duration: exam_params[:duration]
        )
        @exam.save!
        render json: {
          created: true,
          id: @exam.id
        }
      rescue StandardError => e
        render json: {
          created: false,
          reason: e.message
        }
      end

      def update
        body = params.require(:exam).permit(:name, :start, :end, :duration)
        updated = @exam.update(
          {
            name: body[:name],
            start_time: DateTime.parse(body[:start]),
            end_time: DateTime.parse(body[:end]),
            duration: body[:duration]
          }
        )
        render json: {
          updated: updated,
          reason: @exam.errors.full_messages.to_sentence
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
          versions: @exam.exam_versions.includes(:registrations).map {|v| serialize_version(v) },
          checklist: @exam.checklist
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
