class ExamsController < ApplicationController
  before_action :require_current_user

  before_action :find_course
  before_action :find_exam
  before_action :require_prof_reg, only: [:new, :create, :edit, :update]
  before_action :require_proctor_reg, only: [:finalize, :proctor]
  before_action :require_student_reg, only: [:take]

  def finalize
    @exam.finalize!
    redirect_back fallback_location: proctor_exam_path(@exam), notice: 'Exam finalized.'
  end

  def edit
    @page_title = "Edit #{@exam.name}"
    @keepnavbar = true
    render inline: "TODO: exam editor for #{@exam.name}"
  end

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
end
