class Professor::ExamsController < ProfessorController
  before_action -> { find_exam(params[:id]) }, except: [:new, :create]
  before_action :require_current_user_registration, except: [:new, :create]

  before_action :require_current_user_professor_for_course, only: [:create]

  def new
    semesters =
      begin
        bottlenose_token.get('/api/courses').parsed
      rescue StandardError
        []
      end
    @courses = semesters.map do |s|
      s['courses'].collect do |c|
        [c['name'], c['id']]
      end
    end.flatten(1)
  end

  def create
    exam_params = params.require(:exam).permit(:name, :file, :course_id, :enabled)
    course_id = exam_params[:course_id]
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
    redirect_to professor_exam_path(@exam), notice: 'Exam created.'
  end
  
  def show; end

  def edit; end

  def update; end
end
