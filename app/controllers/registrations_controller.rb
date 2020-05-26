class RegistrationsController < ApplicationController
  before_action :require_current_user

  before_action :find_course
  before_action :find_exam
  before_action :find_room
  before_action :find_registration

  before_action :require_exam_enabled
  before_action :require_prof_reg, only: [:show, :finalize]

  before_action :check_anomaly, only: [:start, :submit]
  before_action :check_final, only: [:start, :submit]

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

  def start
    answers = @registration.current_answers
    version = @exam.version_for(@registration)
    render(
      json: {
        type: 'CONTENTS',
        exam: {
          questions: version['contents']['questions'],
          reference: version['contents']['reference'],
          instructions: version['contents']['instructions'],
          files: @exam.files
        },
        answers: answers,
        messages: messages,
        questions: questions
      }
    )
  end

  def submit
    permitted = params.permit(:id, exam: {}, answers: {})
    answers = permitted[:answers].to_h
    saved = @registration.save_answers(answers)
    @registration.update(final: true)
    render json: { lockout: !saved }
  end

  def finalize
    @registration.update(final: true)
    redirect_back fallback_location: exam_path(@exam)
  end

  private

  def check_anomaly
    return unless @registration.anomalous?

    render(
      json: {
        type: 'ANOMALOUS'
      }
    )
  end

  def check_final
    return unless @registration.final?

    redirect_to exams_path, alert: 'Your submission for that exam has been marked final.'
  end
end
