class RegistrationsController < ApplicationController
  before_action :require_current_user

  before_action :find_course
  before_action :find_exam
  before_action :find_room
  before_action :find_registration

  before_action :require_exam_enabled
  before_action :require_prof_reg, only: [:show, :finalize]

  def show
    @version = @exam.version_for(@registration)
    @answers = @registration.current_answers
    render component: 'proctor/registrations/show', props: {
      railsExam: {
        id: @exam.id,
        name: @exam.name,
        policies: @exam.info['policies']
      },
      contents: {
        exam: {
          questions: @version['contents']['questions'],
          reference: @version['contents']['reference'],
          instructions: @version['contents']['instructions'],
          files: @exam.files
        },
        answers: @answers
      }
    }, prerender: false
  end

  def finalize
    @registration.update(final: true)
    redirect_back fallback_location: exam_path(@exam)
  end
end
