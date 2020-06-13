# frozen_string_literal: true

module UploadTestHelper
  def self.with_temp_fixture_zip(name)
    Dir.mktmpdir do |path|
      dir = Pathname.new path
      zip = dir.join("#{name}.zip")
      exam_path = Rails.root.join('test', 'fixtures', 'files', name, '**')
      ArchiveUtils.create_zip zip, Dir.glob(exam_path)
      file = File.new(zip)
      yield file
    end
  end

  def self.with_test_uploaded_zip(name, mime_type = nil)
    with_temp_fixture_zip name do |f|
      yield Rack::Test::UploadedFile.new(f.path, mime_type, false)
    end
  end
end
