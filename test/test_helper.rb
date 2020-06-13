ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

require 'minitest/reporters'
Minitest::Reporters.use! [Minitest::Reporters::SpecReporter.new]

module TestHelpers
  def fixture_zip(name)
    Dir.mktmpdir do |path|
      dir = Pathname.new path
      zip = dir.join("#{name}.zip")
      exam_path = Rails.root.join('test', 'fixtures', 'files', name, '**')
      ArchiveUtils.create_zip zip, Dir.glob(exam_path)
      real_upload = ActionDispatch::Http::UploadedFile.new(
        tempfile: File.new(zip)
      )
      Upload.new(real_upload)
    end
  end
end

class FactoryBot::SyntaxRunner
  include TestHelpers
end

class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all
  include FactoryBot::Syntax::Methods
  include TestHelpers
end
