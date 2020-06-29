# frozen_string_literal: true
require 'test_helper'

class MainControllerTest < ActionDispatch::IntegrationTest
  test "should get home" do
    get root_url
    assert_redirected_to new_user_session_path
  end
end
