# frozen_string_literal: true

require 'test_helper'

class RoomTest < ActiveSupport::TestCase
  test 'factory creates valid room' do
    assert build(:room).valid?
  end
end
