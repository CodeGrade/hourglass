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

    def compact_blank(val)
      return nil if val.blank? && (val != false)

      case val
      when Hash
        val.transform_values { |v| compact_blank(v) }.reject { |_, v| v.blank? && (v != false) }
      when Array
        val.map { |v| compact_blank(v) }
      else
        val
      end
    end
  end
end
