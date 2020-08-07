reloader = ActiveSupport::FileUpdateChecker.new([], {
  Rails.root.join('app/graphql/types').to_s => ['rb'],
  Rails.root.join('app/graphql/mutations').to_s => ['rb'],
}) do
  HourglassSchema.write_json!
end

Rails.application.config.to_prepare do
  reloader.execute_if_updated
end

Rails.application.config.after_initialize do
  HourglassSchema.write_json!
end

if File.exists?(Rails.root.join('config/schemas/graphql-queries.json'))
  STATIC_GRAPHQL_QUERIES = JSON.parse(File.read(Rails.root.join('config/schemas/graphql-queries.json')))
  KNOWN_GRAPHQL_QUERIES = STATIC_GRAPHQL_QUERIES.invert
else
  STATIC_GRAPHQL_QUERIES = {}
  KNOWN_GRAPHQL_QUERIES = STATIC_GRAPHQL_QUERIES.invert
end

if Rails.env.production?
  STATIC_GRAPHQL_QUERIES.each do |k, v| v.freeze end
  STATIC_GRAPHQL_QUERIES.freeze
  KNOWN_GRAPHQL_QUERIES.each do |k, v| v.freeze end
  KNOWN_GRAPHQL_QUERIES.freeze
end