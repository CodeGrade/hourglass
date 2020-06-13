# frozen_string_literal: true

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

FactoryBot.define do
  factory :upload do
    cs2500_v1

    trait :cs2500_v1 do
      transient do
        file_name { 'cs2500midterm-v1' }
      end
    end

    trait :cs2500_v2 do
      transient do
        file_name { 'cs2500midterm-v2' }
      end
    end

    trait :cs3500_v1 do
      transient do
        file_name { 'cs3500final' }
      end
    end

    initialize_with { fixture_zip(file_name) }
    to_create {}
  end
end
