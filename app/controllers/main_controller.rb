class MainController < ApplicationController
  def index
    return redirect_to new_user_session_path unless current_user

    @page_title = 'My Exams'
    @keepnavbar = true
    student_regs = Registration.where(user: current_user)
    proctor_regs = ProfessorCourseRegistration.where(user: current_user)
    all_regs = student_regs + proctor_regs
    render component: 'main', props: {
      regs: {
        student: student_regs.map do |reg|
          reg.slice(:id)
        end,
        proctor: proctor_regs.map do |reg|
          reg.slice(:id)
        end
      },
      regInfo: all_regs.map do |reg|
        [reg.id, {
          exam: reg.exam.slice(:id, :name),
          course: reg.course.slice(:id)
        }]
      end.to_h
    }, prerender: false
  end
end
