# frozen_string_literal: true

namespace :graphql do
  desc 'Update schema.json file'
  task update_schema: :environment do
    HourglassSchema.write_json!
    HourglassSchema.write_graphql!
    HourglassSchema.ensure_queries_file!
  end
end
