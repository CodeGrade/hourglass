require 'active_record/fixtures'

module FixtureFileHelpers
  # Add more helper methods to be used by all tests here...
  def fixture_zip(name)
    Dir.mktmpdir do |path|
      dir = Pathname.new path
      zip = dir.join("#{name}.zip")
      exam_path = Rails.root.join('test', 'fixtures', 'files', name, '**')
      ArchiveUtils.create_zip zip, Dir.glob(exam_path)
      Upload.new(FakeUpload.new(zip))
    end
  end
end
ActiveRecord::FixtureSet.context_class.include FixtureFileHelpers
