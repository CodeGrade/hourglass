# frozen_string_literal: true

require 'application_system_test_case'

class AnomaliesTest < ApplicationSystemTestCase
  def setup
    Webpacker.compile
    @version = create(:exam_version, :with_lockdown)
    @exam = @version.exam
    @registration = create(:registration, exam: @exam, exam_version: @version)
    @student = @registration.user
    sign_in @student
    visit "/exams/#{@exam.id}"
    start_btn = find_button class: 'btn-success'
    start_btn.click
  end

  test 'leaving fullscreen' do
    skip
  end
end
