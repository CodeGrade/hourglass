# frozen_string_literal: true

require_relative '../helpers/upload'

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
        file_name { 'cs3500final-v1' }
      end
    end

    trait :cs3500_v2 do
      transient do
        file_name { 'cs3500final-v2' }
      end
    end

    initialize_with do
      UploadTestHelper.with_test_uploaded_fixture_zip file_name do |real_upload|
        Upload.new(real_upload)
      end
    end

    to_create do
      # deliberately do nothing
    end
  end
end
