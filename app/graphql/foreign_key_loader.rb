# from https://pganalyze.com/blog/efficient-graphql-queries-in-ruby-on-rails-and-postgres
class ForeignKeyLoader < GraphQL::Batch::Loader
  attr_reader :model, :foreign_key, :merge

  def self.loader_key_for(*group_args)
    # avoiding including the `merge` lambda in loader key
    # each lambda is unique which defeats the purpose of
    # grouping queries together
    [self].concat(group_args.slice(0,2))
  end

  def initialize(model, foreign_key, merge: nil)
    @model = model
    @foreign_key = foreign_key
    @merge = merge
  end

  def perform(foreign_ids)
    # find all the records
    puts "In ForeignKeyLoader, model=#{model}, foreign_ids=#{foreign_ids}"
    scope = model.where(foreign_key => foreign_ids)
    scope = scope.merge(merge) if merge.present?
    records = scope.to_a

    foreign_ids.each do |foreign_id|
      # find the records required to fulfill each promise
      matching_records = records.select do |r|
        foreign_id == r.send(foreign_key)
      end
      fulfill(foreign_id, matching_records)
    end
  end
end