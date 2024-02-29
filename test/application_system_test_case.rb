# frozen_string_literal: true

require 'test_helper'

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  include Devise::Test::IntegrationHelpers
  DRIVER = if ENV["DRIVER"]
    ENV["DRIVER"].to_sym
  else
    :headless_chrome
  end
  driven_by :selenium, using: DRIVER, screen_size: [1400, 1400]
end
