# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'
require 'capybara/rails'

require 'minitest/reporters'
Minitest::Reporters.use! [
  Minitest::Reporters::DefaultReporter.new(
    color: true,
    detailed_skip: false,
  ),
  # Minitest::Reporters::SpecReporter.new
]

OmniAuth.config.test_mode = true
Rails.application.env_config["devise.mapping"] = Devise.mappings[:user] # If using Devise


def find_executable(names)
  names
    .map { |name| [name, *ENV['PATH'].split(File::PATH_SEPARATOR).map { |p| File.join(p, name) }] }
    .flatten
    .find { |f| File.executable?(f) }
end

driver_path = find_executable ['chromium.chromedriver', 'chromedriver']
if driver_path&.start_with? '/snap'
  Selenium::WebDriver::Chrome::Service.driver_path = proc { driver_path }
else
  Selenium::WebDriver::Chrome.path = find_executable ['chrome', 'chromium-browser', 'chromium']
end

module ActionDispatch
  class IntegrationTest
    include Devise::Test::IntegrationHelpers

    # Make the Capybara DSL available in all integration tests
    include Capybara::DSL

    # Stop ActiveRecord from wrapping tests in transactions
    self.use_transactional_tests = false

    setup do
      Capybara.default_driver = :selenium_chrome_headless
      DatabaseCleaner.clean_with :truncation
    end

    teardown do
      Capybara.reset_sessions! # Forget the (simulated) browser state
      # Capybara.use_default_driver # Revert Capybara.current_driver to Capybara.default_driver

      DatabaseCleaner.clean_with :truncation
      # Upload.cleanup_test_uploads!
    end
  end
end

module Enumerable
  def sorted?
    each_cons(2).all? { |a, b| (a <=> b) <= 0 }
  end

  def sorted_by?
    each_cons(2).all? { |a, b| ((yield a) <=> (yield b)) <= 0 }
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

DatabaseCleaner.strategy = :deletion
DatabaseCleaner.start
DatabaseCleaner.clean_with :truncation
