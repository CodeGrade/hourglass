# frozen_string_literal: true

def with_fixture_zip_upload(name)
  Dir.mktmpdir do |path|
    dir = Pathname.new path
    zip = dir.join("#{name}.zip")
    exam_path = Rails.root.join('test', 'fixtures', 'files', name, '**')
    ArchiveUtils.create_zip zip, Dir.glob(exam_path)
    real_upload = ActionDispatch::Http::UploadedFile.new(
      tempfile: File.new(zip)
    )
    yield real_upload
  end
end
