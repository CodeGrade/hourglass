# frozen_string_literal: true

require 'test_helper'

class UploadTest < ActiveSupport::TestCase
  test 'confirm process_marks doesnt trim too much' do
    text = 'text'
    marked_code = "~ro:1:s~#{text}~ro:1:e~"
    4.times do |num_trailing_lines|
      test_string = marked_code + ("\n" * num_trailing_lines)
      marks = MarksProcessor.process_marks(test_string)
      assert_equal [
        {
          from: { line: 0, ch: 0 },
          to: { line: 0, ch: text.length },
          options: { inclusiveLeft: true, inclusiveRight: num_trailing_lines < 2 },
        },
      ], marks[:marks]
    end
  end
end
