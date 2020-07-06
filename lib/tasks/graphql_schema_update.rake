# frozen_string_literal: true

namespace :graphql do
  desc 'Update schema.json file'
  task update_schema: :environment do
    HourglassSchema.write_json!
  end
end
