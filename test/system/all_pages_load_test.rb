# frozen_string_literal: true

require 'application_system_test_case'

class AllPagesLoadTest < ApplicationSystemTestCase
  # driven_by :selenium, using: :chrome, screen_size: [1400, 1400]
  def setup
    @version = create(:exam_version, upload: create(:upload, :extra_credit))
    @exam = @version.exam
    @course = @exam.course
    @registration = create(:registration, exam_version: @version)
    @student = @registration.user
    @professor_reg = create(:professor_course_registration, course: @exam.course)
    @professor = @professor_reg.user
    @ta_reg = create(:staff_registration, section: create(:section, course: @exam.course))
    @ta = @ta_reg.user
    @qp_pairs = @version.qp_pairs
    @expected = @qp_pairs.map do |qp|
      ec = qp[:question].extra_credit || qp[:part].extra_credit ? ' extra credit' : ''
      points = qp[:part].points
      points = points.to_i if points == points.to_i
      "#{points} #{'point'.pluralize(points)}#{ec}"
    end
  end

  def course_id(course)
    HourglassSchema.id_from_object(course, Types::CourseType, nil)
  end

  def exam_id(exam)
    HourglassSchema.id_from_object(exam, Types::ExamType, nil)
  end

  def registration_id(reg)
    HourglassSchema.id_from_object(reg, Types::RegistrationType, nil)
  end

  def assert_breadcrumbs(crumbs)
    5.times do
      break if page.has_css?('span.nav-breadcrumb', visible: true)
    end
    page.assert_selector(:css, 'span.nav-breadcrumb', visible: true, count: crumbs.size)
    page.all(:css, 'span.nav-breadcrumb').zip(crumbs).each do |act, exp|
      act.assert_text(:all, exp)
    end
  end

  test 'student @ homepage' do
    sign_in @student
    visit '/'
    page.assert_text('Hourglass')
    assert_breadcrumbs []
  end

  test 'student @ exam before start' do
    sign_in @student
    visit "/exams/#{exam_id(@exam)}"
    page.assert_text('Hourglass')
    assert_breadcrumbs []
  end

  test 'student @ exam after finalize' do
    @registration.finalize!
    sign_in @student
    visit "/exams/#{exam_id(@exam)}"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@exam.name]
  end

  test 'student @ exam after exam over' do
    @registration.finalize!
    @exam.update!(start_time: 2.days.ago, end_time: 1.day.ago)
    sign_in @student
    visit "/exams/#{exam_id(@exam)}"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@exam.name]
  end

  test 'prof @ homepage' do
    sign_in @professor
    visit '/'
    page.assert_text('Hourglass')
    assert_breadcrumbs []
  end

  test 'prof @ course' do
    sign_in @professor
    visit "/courses/#{course_id(@course)}"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title]
  end

  test 'prof @ exam admin' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/admin"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name]
  end

  test 'prof @ exam proctor' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/proctoring"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name, 'Proctoring']
  end

  test 'prof @ exam grading admin' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/grading/admin"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name, 'Grading']
  end

  test 'prof @ exam grading' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/grading"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name, 'Grading']
  end

  test 'prof @ submissions' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/submissions"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name, 'Submissions']
  end

  test 'prof @ submission' do
    @registration.finalize!
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/submissions/#{registration_id(@registration)}"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name, 'Submissions', @student.display_name]
  end

  test 'prof @ submission timeline' do
    @registration.finalize!
    # NOTE: We just need at least one snapshot for the page to load properly.
    # NOTE: not using Registration#save_answers since I don't care about the content,
    # and the default_answers won't be saved since they're not different from the
    # current_answers...
    Snapshot.create!(registration: @registration, answers: @registration.current_answers)
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/submissions/#{registration_id(@registration)}/timeline"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name, 'Submissions', @student.display_name, 'Timeline']
  end

  test 'prof @ stats' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/stats"
    page.assert_text('Hourglass')
    assert_breadcrumbs [@course.title, @exam.name, 'Statistics']
  end
end
