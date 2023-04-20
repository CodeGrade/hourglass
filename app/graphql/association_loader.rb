# frozen_string_literal: true

# from https://github.com/Shopify/graphql-batch/blob/master/examples/association_loader.rb
class AssociationLoader < GraphQL::Batch::Loader
  def self.validate(model, association_name)
    new(model, association_name)
    nil
  end

  def initialize(model, association_name, includes: nil, merge: nil)
    @model = model
    @association_name = association_name
    @merge = merge
    @includes = includes
    validate
  end

  def load(record)
    raise TypeError, "#{@model} loader can't load association for #{record.class}" unless record.is_a?(@model)
    return Promise.resolve(read_association(record)) if association_loaded?(record)

    super
  end

  # We want to load the associations on all records, even if they have the same id
  def cache_key(record)
    record.object_id
  end

  def perform(records)
    preload_association(records)
    records.each { |record| fulfill(record, read_association(record)) }
  end

  private

  def validate
    return if @model.reflect_on_association(@association_name)

    raise ArgumentError, "No association #{@association_name} on #{@model}"
  end

  def preload_association(records)
    if @includes.present?
      ::ActiveRecord::Associations::Preloader.new.preload(records, Hash[@association_name, @includes])
    else
      ::ActiveRecord::Associations::Preloader.new.preload(records, @association_name)
    end
  end

  def read_association(record)
    scope = record.public_send(@association_name)
    scope = scope.includes(@includes) if @includes.present?
    scope = scope.merge(@merge) if @merge.present?
    scope
  end

  def association_loaded?(record)
    record.association(@association_name).loaded?
  end
end
