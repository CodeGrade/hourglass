# frozen_string_literal: true

def fixture_zip(name)
  Dir.mktmpdir do |path|
    dir = Pathname.new path
    zip = dir.join("#{name}.zip")
    exam_path = Rails.root.join('test', 'fixtures', 'files', name, '**')
    ArchiveUtils.create_zip zip, Dir.glob(exam_path)
    Upload.new(FakeUpload.new(zip))
  end
end

cs2500upload1 = fixture_zip 'cs2500midterm-v1'
cs2500upload2 = fixture_zip 'cs2500midterm-v2'
cs3500upload1 = fixture_zip 'cs3500final'

FactoryBot.define do
  factory :exam_version do
    transient do
      # upload { build(:upload) }
      upload { cs2500upload1 }
    end

    exam
    sequence(:name) { |n| "CS2500 Version #{n}" }
    files { upload.files }
    info { upload.info }
  end
end
