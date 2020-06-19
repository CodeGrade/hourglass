# frozen_string_literal: true

require 'application_system_test_case'

class AnomaliesTest < ApplicationSystemTestCase
  def setup
    Webpacker.compile
    @registration = create(:registration)
    @student = @registration.user
    @exam = @registration.exam
    sign_in @student
  end

  test 'visiting the start page' do
    visit "/exams/#{@exam.id}"
    # binding.pry
  end
end
