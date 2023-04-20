# frozen_string_literal: true

# Base class for Hourglass records, with some utility methods
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  def self.multi_group_by(hash, keys, last_key_unique = false, index = 0)
    if index >= keys.count || hash.nil?
      hash
    elsif index == keys.count - 1 && last_key_unique
      Hash[hash.map { |v| [(v[keys[index]] rescue v.__send__(keys[index])), v]}]
    else
      Hash[hash.group_by(&(keys[index])).map { |k, v| [k, multi_group_by(v, keys, last_key_unique, index + 1)]}]
    end
  end

  def multi_group_by(hash, keys, last_key_unique = false, index = 0)
    ApplicationRecord.multi_group_by(hash, keys, last_key_unique, index)
  end

  def compact_blank(val)
    return nil if val.blank? && (val != false)

    case val
    when Hash
      val.transform_values { |v| compact_blank(v) }.reject { |k, v| v.blank? && (v != false) }
    when Array
      val.map { |v| compact_blank(v) }
    else
      val
    end
  end

  def swap_association(assocClass, assoc, key, index_from, index_to)
    return if index_from == index_to
    assocClass.transaction do
      found = multi_group_by(assoc.where(key => [index_from, index_to]), [key], true)
      r_from = found[index_from]
      r_to = found[index_to]
      raise "Could not find #{key} #{index_from} on #{assocClass} for #{self}" unless r_from
      raise "Could not find #{key} #{index_to} on #{assocClass} for #{self}" unless r_to
      r_from.update_columns(key => assoc.count + 1)
      r_to.update_columns(key =>  index_from)
      r_from.update_columns(key => index_to)
    end
    assoc.reset; nil
  end

  def move_association(assocClass, assoc, key, index_from, index_to)
    return if index_from == index_to
    assocClass.transaction do
      count = assoc.count
      [index_from, index_to].each do |index|
        raise "Invalid #{key} #{index} on #{assocClass}" if index < 0 || index >= count
      end
      if index_from < index_to
        range = (index_from..index_to).to_a
        offset = -1
      else
        range = (index_to..index_from).to_a.reverse
        offset = 1
      end
      found = multi_group_by(assoc.where(key => range), [key], true)
      raise "Could not find all #{range.size} #{key} on #{assocClass}" unless found.size == range.size
      todo = range.map do |idx|
        [found[idx], idx + offset]
      end
      todo.shift # toss the first item, since it's the wrong index
      todo.push([found[range.first], range.last]) # cycle the first item to the end,
      todo.unshift([found[range.first], count + 1]) # and add a placeholder in front
      todo.each do |obj, idx|
        obj.update_columns(key => idx)
      end
      assoc.reset; nil
    end
  end
end
