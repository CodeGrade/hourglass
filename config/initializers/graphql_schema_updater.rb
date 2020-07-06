reloader = ActiveSupport::FileUpdateChecker.new([], {
  Rails.root.join('app/graphql/types').to_s => ['rb'],
  Rails.root.join('app/graphql/mutations').to_s => ['rb']
}) do
  HourglassSchema.write_json!
end

Rails.application.config.to_prepare do
  reloader.execute_if_updated
end

Rails.application.config.after_initialize do
  HourglassSchema.write_json!
end