# frozen_string_literal: true

require 'application_system_test_case'

class ExtraCreditTest < ApplicationSystemTestCase
  test 'extra credits should be visible to students' do
    @version = create(:exam_version, upload: create(:upload, :extra_credit))
    @exam = @version.exam
    @registration = create(:registration, exam_version: @version)
    @student = @registration.user
    sign_in @student
    visit "/exams/#{HourglassSchema.id_from_object(@exam, Types::ExamType, nil)}"
    start_btn = find_button class: 'btn-success'
    start_btn.click
    page.assert_selector(".point-count", count: 12)
    expected = [
      "(1 point)",
      "(2 points)",
      "(3 points extra credit)",
      "(4 points extra credit)",
      "(5 points extra credit)",
      "(6 points extra credit)",
      "(7 points extra credit)",
      "(8 points extra credit)",
      "(9 points)",
      "(19 points extra credit)",
      "(10 points extra credit)",
      "(20 points extra credit)",
    ]
    page.all(:css, ".point-count").zip(expected).each do |pc, expected|
      pc.assert_text expected
    end
  end
end
