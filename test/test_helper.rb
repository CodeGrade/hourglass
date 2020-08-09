# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

require 'minitest/reporters'
Minitest::Reporters.use! [
  Minitest::Reporters::DefaultReporter.new(
    color: true,
    detailed_skip: false,
  ),
  # Minitest::Reporters::SpecReporter.new
]

Selenium::WebDriver::Chrome::Service.driver_path = `which chromedriver`.chomp

chromium_path = `which chromium`.chomp
chromium_path = `which chromium-browser`.chomp if chromium_path.blank?
Selenium::WebDriver::Chrome.path = chromium_path

module ActionDispatch
  class IntegrationTest
    include Devise::Test::IntegrationHelpers
  end
end

module ActiveSupport
  class TestCase
    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all
    require 'factory_bot_rails'
    include FactoryBot::Syntax::Methods
  end
end
