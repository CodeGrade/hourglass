# frozen_string_literal: true

require 'application_system_test_case'

class ExtraCreditTest < ApplicationSystemTestCase
  # driven_by :selenium, using: :chrome, screen_size: [1400, 1400]
  def setup
    @version = create(:exam_version, upload: create(:upload, :extra_credit))
    @exam = @version.exam
    @registration = create(:registration, exam_version: @version)
    @student = @registration.user
    @professor_reg = create(:professor_course_registration, course: @exam.course)
    @professor = @professor_reg.user
    @ta_reg = create(:staff_registration, section: create(:section, course: @exam.course))
    @ta = @ta_reg.user
    @qp_pairs = @version.qp_pairs
    @expected = @qp_pairs.map do |qp|
      ec = (qp[:question].extra_credit || qp[:part].extra_credit) ? ' extra credit' : ''
      points = qp[:part].points
      points = points.to_i if points == points.to_i
      "#{points} #{'point'.pluralize(points)}#{ec}"
    end
  end

  def exam_id(exam)
    HourglassSchema.id_from_object(exam, Types::ExamType, nil)
  end

  def registration_id(reg)
    HourglassSchema.id_from_object(reg, Types::RegistrationType, nil)
  end

  test 'extra credits should be visible to students during exam' do
    sign_in @student
    visit "/exams/#{exam_id(@exam)}"
    find_button(class: 'btn-success').click
    page.assert_selector('.point-count', count: 12)
    page.all(:css, '.point-count').zip(@expected).each do |pc, exp|
      pc.assert_text "(#{exp})"
    end
  end

  test 'exam not visible to students until published' do
    @registration.finalize!
    sign_in @student
    visit "/exams/#{exam_id(@exam)}"
    page.assert_text 'You have submitted this exam'
  end

  test 'extra credits should be visible to students after exam' do
    @registration.finalize!
    @registration.update(published: true)
    sign_in @student
    visit "/exams/#{exam_id(@exam)}/submissions/#{registration_id(@registration)}"
    page.assert_selector('.point-count', count: 12)
    page.all(:css, '.point-count').zip(@expected).each do |pc, exp|
      num = exp.split(" ").first
      pc.assert_text "#{num} / #{exp}"
    end
    # With no grading, student gets _full_ credit, including extra credit
    total = @expected.map { |e| e.split(" ").first.to_i }.sum
    normal = @expected
      .reject { |e| e.include?("extra") }
      .map { |e| e.split(" ").first.to_i }
      .sum
    page.assert_text "Grade: #{(100 * (total.to_f / normal.to_f)).to_i}"
  end

  test 'extra credits should be visible to professor before finalized' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/submissions/#{registration_id(@registration)}"
    page.assert_selector('.point-count', count: 12)
    page.all(:css, '.point-count').zip(@expected).each do |pc, exp|
      num = exp.split(" ").first
      pc.assert_text "#{num} / #{exp}"
    end
  end

  test 'extra credits should be visible to TA before finalized' do
    sign_in @ta
    visit "/exams/#{exam_id(@exam)}/submissions/#{registration_id(@registration)}"
    page.assert_selector('.point-count', count: 12)
    page.all(:css, '.point-count').zip(@expected).each do |pc, exp|
      num = exp.split(" ").first
      pc.assert_text "#{num} / #{exp}"
    end
  end

  test 'extra credits should be visible during grading' do
    @registration.finalize!
    @exam.initialize_grading_locks!
    # prefill all comments, so we can just zip through "completed" rubrics
    @qp_pairs.each do |qp|
      qp[:part].body_items.each do |bi|
        bi.preset_comments.where(points: 0).each do |preset|
          create_comment(@registration, qp[:question], qp[:part], bi, preset)
        end
      end
    end
    sign_in @ta
    visit '/'
    find_button('Start Grading').click
    find_button('Begin grading...').click
    find_link('Whatever is needed').click
    @expected.each_with_index do |exp, idx|
      find_button('Continue grading').click if idx.positive?
      page.assert_text exp
      find_button('Finish this submission and start next one').click
    end
  end

  def create_comment(reg, q, p, b, preset)
    GradingComment.create!(
      creator: @ta,
      registration: reg,
      question: q,
      part: p,
      body_item: b,
      preset_comment: preset,
      points: preset.points,
      message: preset.grader_hint
    )
  end
end
