def write_schema!
  File.open('app/javascript/relay/data/schema.json', 'w') do |f|
    f.write(HourglassSchema.execute(GraphQL::Introspection::INTROSPECTION_QUERY).to_json)
  end
end

reloader = ActiveSupport::FileUpdateChecker.new([], {
  Rails.root.join('app/graphql/types').to_s => ['rb'],
  Rails.root.join('app/graphql/mutations').to_s => ['rb']
}) do
  write_schema!
end

Rails.application.config.to_prepare do
  reloader.execute_if_updated
end

Rails.application.config.after_initialize do
  write_schema!
end
