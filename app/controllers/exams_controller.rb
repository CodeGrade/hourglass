class ExamsController < ApplicationController
  before_action :require_current_user

  before_action :find_course
  before_action :find_exam

  before_action :require_prof_reg, only: [:new, :create]
  before_action :require_proctor_reg, only: [:finalize, :proctor]

  prepend_before_action :require_current_user_unique_session, only: [:take, :during]
  before_action :require_student_reg, only: [:take, :during]
  before_action :check_anomaly, only: [:take, :during]
  before_action :check_final, only: [:take, :during]

  def finalize
    @exam.finalize!
    redirect_back fallback_location: exam_path(@exam), notice: 'Exam finalized.'
  end

  def edit
    @page_title = "Edit #{@exam.name}"
    @keepnavbar = true
    render inline: "TODO: exam editor for #{@exam.name}"
  end

  def during
    case params[:task]
    when 'start' then render json: exam_contents
    when 'snapshot' then render json: snapshot
    when 'submit' then render json: submit
    when 'anomaly' then render json: anomaly
    when 'question' then render json: question
    end
  end

  # GET: show exam loader
  def take
    render component: 'student/exams/show', props: {
      railsUser: {
        displayName: current_user.display_name
      },
      railsExam: {
        id: @exam.id,
        name: @exam.name,
        policies: @exam.info['policies']
      },
      railsRegistration: {
        id: @registration.id,
        anomalous: @registration.anomalous?
      },
      railsCourse: {
        id: @course.id
      },
      final: @registration.final?
    }, prerender: false
  end

  def proctor
    render inline: 'exam proctoring here'
  end

  def new
    @keepnavbar = true
    @page_title = 'New Exam'
    render component: 'professor/exams/new', props: {
      course: @course
    }, prerender: false
  end

  def create
    exam_params = params.require(:exam).permit(:name, :file, :course_id, :enabled)
    course_id = params[:course_id]
    file = exam_params[:file]
    upload = Upload.new(file)
    Audit.log("Uploaded file #{file.original_filename} for #{current_user.username} (#{current_user.id})")
    @exam = Exam.new(
      name: exam_params[:name],
      enabled: exam_params[:enabled],
      course_id: course_id,
      info: upload.info,
      files: upload.files
    )
    @exam.save!
    room = Room.create!(
      exam: @exam,
      name: 'Exam Room'
    )
    Registration.create!(
      exam: @exam,
      user: current_user,
      role: current_user.role.to_s,
      room: room
    )
    redirect_to professor_course_exam_path(course_id, @exam), notice: 'Exam created.'
  end

  private

  def question
    q_params = params.require(:question).permit(:body)
    q = Question.new body: q_params[:body], exam: @exam, sender: current_user
    {
      success: q.save,
      messages: q.errors.full_messages
    }
  end

  def anomaly
    if @registration.user != current_user
      render json: { created: false }
      return
    end
    @anomaly = Anomaly.new(params.require(:anomaly).permit(:reason))
    @anomaly.registration = @registration
    saved = @anomaly.save
    {
      created: saved
    }
  end

  def submit
    permitted = params.permit(:id, exam: {}, answers: {})
    answers = permitted[:answers].to_h
    saved = @registration.save_answers(answers)
    @registration.update(final: true)
    render json: { lockout: !saved }
  end

  def exam_contents
    answers = @registration.current_answers
    version = @exam.version_for(@registration)
    {
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
  end

  def snapshot
    permitted = params.permit(:lastMessageId, :exam_id, answers: {}, exam: {})
    last_message_id = permitted.require(:lastMessageId)
    answers = permitted.require(:answers).to_h
    saved = @registration.save_answers(answers)
    {
      lockout: !saved,
      messages: messages_after(last_message_id)
    }
  end

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

  def require_current_user_unique_session
    require_current_user
  rescue DoubleLoginException => e
    registration = Registration.find_by(
      user_id: e.user.id,
      exam_id: params[:exam_id]
    )
    if registration
      Anomaly.create(registration: registration, reason: e.message)
    end
    render json: { lockout: true, reason: e.message }
  end

  def messages_after(last_message_id)
    # TODO
    []
    # msgs = @registration
    #        .all_messages_for(current_user)
    #        .where('id > ?', last_message_id)
    #        .order(:created_at)
    # msgs.map(&:serialize)
  end

  # Returns all of the questions the current user has asked for this exam.
  def questions
    qs = @registration.my_questions.order(created_at: :desc)
    qs.map(&:serialize)
  end

  # Returns the announcements and messages for the current registration.
  def messages
    msgs = @registration.all_messages_for(current_user).sort_by(&:id)
    msgs.map(&:serialize)
  end
end
