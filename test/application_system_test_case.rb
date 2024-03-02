# frozen_string_literal: true

require 'test_helper'

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  include Devise::Test::IntegrationHelpers
  DRIVER = if ENV['DRIVER']
             ENV['DRIVER'].to_sym
           else
             :headless_chrome
           end
  driven_by :selenium, using: DRIVER, screen_size: [1400, 1400]

  def with_resize_to(width, height)
    old_width, old_height = page.current_window.size
    page.current_window.resize_to(width, height)
    begin
      yield
    ensure
      page.current_window.resize_to(old_width, old_height)
    end
  end
end
