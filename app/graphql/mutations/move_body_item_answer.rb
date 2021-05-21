# frozen_string_literal: true

module Mutations
  class MoveBodyItemAnswer < BaseMutation
    argument :body_item_id, ID, required: true, loads: Types::BodyItemType
    argument :from_index, Integer, required: true
    argument :to_index, Integer, required: true
    argument :is_matching_prompts, boolean, required: false

    field :body_item, Types::BodyItemType, null: false

    def authorized?(body_item:, **_kwargs)
      return true if body_item.course.user_is_professor?(context[:current_user])

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(body_item:, from_index:, to_index:, is_matching_prompts: nil)
      info = body_item.info
      type = info['type']

      case type
      when 'Matching'
        resolve_matching(
          info: info,
          from_index: from_index,
          to_index: to_index,
          is_matching_prompts: is_matching_prompts,
        )
      when 'AllThatApply'
        resolve_all_that_apply(
          info: info,
          from_index: from_index,
          to_index: to_index,
        )
      when 'MultipleChoice'
        resolve_multiple_choice(
          info: info,
          from_index: from_index,
          to_index: to_index,
        )
      else
        raise GraphQL::ExecutionError, "Cannot move body item answers for a #{type}"
      end

      saved = body_item.save
      raise GraphQL::ExecutionError, body_item.errors.full_messages.to_sentence unless saved

      { body_item: body_item }
    end

    def resolve_matching(info:, from_index:, to_index:, is_matching_prompts: nil)
      case is_matching_prompts
      when true
        info['prompts'] = move_array(info['prompts'], from_index, to_index)
        info['answer'] = move_array(info['answer'], from_index, to_index)
      when false
        info['values'] = move_array(info['values'], from_index, to_index)
        remapped = move_array((0...info['values'].size).to_a, from_index, to_index)
        info['answer'].map! do |old_index|
          remapped[old_index]
        end
      else
        raise GraphQL::ExecutionError, 'Cannot move matching item answers without isMatchingPrompts'
      end
    end

    def resolve_all_that_apply(body_item:, from_index:, to_index:)
      info['options'] = move_array(info['options'], from_index, to_index)
      info['answer'] = move_array(info['answer'], from_index, to_index)
    end

    def resolve_multiple_choice(body_item:, from_index:, to_index:)
      info['options'] = move_array(info['options'], from_index, to_index)
      remapped = move_array((0...info['options'].size).to_a, from_index, to_index)
      info['answer'] = remapped[info['answer']]
    end

    def move_array(arr, from, to)
      return arr if from == to

      arr = arr.dup
      cycle = arr.slice!([from, to].min..[from, to].max)
      cycle.rotate!(from < to ? 1 : -1)
      arr.insert([from, to].min, *cycle)

      arr
    end
  end
end
