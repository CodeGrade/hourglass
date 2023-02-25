# frozen_string_literal: true

require 'application_system_test_case'

class AnomaliesTest < ApplicationSystemTestCase
  test 'leaving fullscreen' do
    @version = create(:exam_version, :with_lockdown)
    @exam = @version.exam
    @registration = create(:registration, exam_version: @version)
    @student = @registration.user
    sign_in @student
    visit "/exams/#{HourglassSchema.id_from_object(@exam, Types::ExamType, nil)}"
    start_btn = find_button class: 'btn-success'
    # NOTE: This would fail in NON-HEADLESS MODE,
    # because there's a stickbar notification at the top that prevents
    # the current screen-size measurements from enabling lockdown
    start_btn.click
    page.assert_no_text 'Make sure that you are using'
    # seem to need both of these, for some reason, to trigger
    # escaping fullscreen from selenium
    page.find('body').right_click
    page.current_window.resize_to(400, 400)
    page.assert_text 'Make sure that you are using'
    visit "/exams/#{HourglassSchema.id_from_object(@exam, Types::ExamType, nil)}"
    page.assert_no_text 'Loading'
    assert_not_equal 0, Anomaly.count
    page.assert_text 'You have been locked out of this exam'
  end
end
