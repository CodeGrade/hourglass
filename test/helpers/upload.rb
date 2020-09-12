# frozen_string_literal: true

module UploadTestHelper
  def self.with_temp_zip(glob_path)
    ArchiveUtils.mktmpdir do |path|
      dir = Pathname.new path
      zip = dir.join("#{name}.zip")
      ArchiveUtils.create_zip zip, Dir.glob(glob_path)
      file = File.new(zip)
      yield file
    end
  end

  def with_test_uploaded_zip(name, mime_type = nil)
    with_temp_zip name do |f|
      yield Rack::Test::UploadedFile.new(f.path, mime_type, false)
    end
  end

  def self.with_temp_fixture_zip(name)
    with_temp_zip(Rails.root.join('test', 'fixtures', 'files', name, '**')) do |f|
      yield f
    end
  end

  def self.with_test_uploaded_fixture_zip(name, mime_type = nil)
    with_temp_fixture_zip name do |f|
      yield Rack::Test::UploadedFile.new(f.path, mime_type, false)
    end
  end
end
