# frozen_string_literal: true

require 'application_system_test_case'

class ExtraCreditTest < ApplicationSystemTestCase
  def setup
    @version = create(:exam_version, upload: create(:upload, :extra_credit))
    @exam = @version.exam
    @registration = create(:registration, exam_version: @version)
    @student = @registration.user
    @professor_reg = create(:professor_course_registration, course: @exam.course)
    @professor = @professor_reg.user
    @ta_reg = create(:staff_registration, section: create(:section, course: @exam.course))
    @ta = @ta_reg.user
    @expected = [
      '1 point',
      '2 points',
      '3 points extra credit',
      '4 points extra credit',
      '5 points extra credit',
      '6 points extra credit',
      '7 points extra credit',
      '8 points extra credit',
      '9 points',
      '19 points extra credit',
      '10 points extra credit',
      '20 points extra credit',
    ]
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
      pc.assert_text "0 / #{exp}"
    end
  end

  test 'extra credits should be visible to professor before finalized' do
    sign_in @professor
    visit "/exams/#{exam_id(@exam)}/submissions/#{registration_id(@registration)}"
    page.assert_selector('.point-count', count: 12)
    page.all(:css, '.point-count').zip(@expected).each do |pc, exp|
      pc.assert_text "0 / #{exp}"
    end
  end

  test 'extra credits should be visible to TA before finalized' do
    sign_in @ta
    visit "/exams/#{exam_id(@exam)}/submissions/#{registration_id(@registration)}"
    page.assert_selector('.point-count', count: 12)
    page.all(:css, '.point-count').zip(@expected).each do |pc, exp|
      pc.assert_text "0 / #{exp}"
    end
  end

  test 'extra credits should be visible during grading' do
    @registration.finalize!
    @exam.initialize_grading_locks!
    sign_in @ta
    visit '/'
    find_button('Start Grading').click
    find_button('Begin grading...').click
    find_link('Whatever is needed').click
    @expected.each do |exp|
      page.assert_text exp
      find_button('Finish this submission and start next one').click
    end
  end
end
