# frozen_string_literal: true

# A body item, part of a question part.
class BodyItem < ApplicationRecord
  belongs_to :part, inverse_of: :body_items

  delegate :visible_to?, to: :part
  delegate :course, to: :part

  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  accepts_nested_attributes_for :rubrics

  # TODO: validate answer with JSON schema

  def self.inheritance_column
    nil
  end

  def self.from_yaml(type, rest)
    if rest.is_a? Hash
      send("from_yaml_#{type}", type, **rest.transform_keys { |key| key.to_s.underscore.to_sym })
    else
      send("from_yaml_#{type}", type, entire_value: rest)
    end
  rescue NoMethodError => e
    raise "Bad body item type: #{type}: #{e}."
  end

  def as_json
    if info.is_a? String
      info
    else
      root_rubric = rubrics.find_by(order: nil)
      rubric_as_json =
        if root_rubric.nil? || root_rubric.is_a?(None)
          nil
        else
          root_rubric.as_json(no_inuse: true).deep_stringify_keys
        end
      send("as_json_#{info['type']}", rubric_as_json)
    end
  end

  # rubocop:disable Naming/MethodName
  def as_json_HTML(_rubric_as_json)
    info['value']
  end

  def as_json_AllThatApply(rubric_as_json)
    {
      'AllThatApply' => {
        'prompt' => unhtml(info['prompt']),
        'options' => info['options'].zip(answer).map do |opt, ans|
          { unhtml(opt) => ans }
        end,
        'rubric' => rubric_as_json,
      }.compact,
    }
  end

  def as_json_Code(rubric_as_json)
    initial = info['initial']
    unless initial.nil?
      if initial.key? 'file'
        # potentially nothing to do here; confirm with parse_info
      else
        unprocessed = MarksProcessor.process_marks_reverse(initial['text'], initial['marks'])
        initial = { 'code' => unprocessed }
      end
    end
    {
      'Code' => {
        'prompt' => unhtml(info['prompt']),
        'lang' => unhtml(info['lang']),
        'initial' => initial,
        'correctAnswer' =>
          if answer.blank? || answer['text'].blank?
            nil
          else
            MarksProcessor.process_marks_reverse(answer['text'], answer['marks'])
          end,
        'rubric' => rubric_as_json,
      }.compact,
    }
  end

  def as_json_CodeTag(rubric_as_json)
    {
      'CodeTag' => {
        'prompt' => unhtml(info['prompt']),
        'choices' => unhtml(info['choices']),
        'correctAnswer' => {
          'filename' => answer['selectedFile'],
          'line' => answer['lineNumber'],
        },
        'rubric' => rubric_as_json,
      }.compact,
    }
  end

  def as_json_Matching(rubric_as_json)
    {
      'Matching' => {
        'prompt' => unhtml(info['prompt']),
        'promptsLabel' => unhtml(info['promptsLabel']),
        'valuesLabel' => unhtml(info['valuesLabel']),
        'prompts' => unhtmls(info['prompts']),
        'values' => unhtmls(info['values']),
        'correctAnswers' => answer,
        'rubric' => rubric_as_json,
      }.compact,
    }
  end

  def as_json_MultipleChoice(rubric_as_json)
    {
      'MultipleChoice' => {
        'prompt' => unhtml(info['prompt']),
        'options' => unhtmls(info['options']),
        'correctAnswer' => answer,
        'rubric' => rubric_as_json,
      }.compact,
    }
  end

  def as_json_Text(rubric_as_json)
    {
      'Text' => {
        'prompt' => unhtml(info['prompt']),
        'correctAnswer' =>
          if answer.is_a? String
            answer
          else
            unhtml(answer&.dig('text'))
          end,
        'rubric' => rubric_as_json,
      }.compact,
    }
  end

  def as_json_YesNo(rubric_as_json)
    case info['yesLabel']
    when 'Yes'
      if info['prompt'].blank?
        { 'YesNo' => answer }
      else
        {
          'YesNo' => {
            'prompt' => unhtml(info['prompt']),
            'correctAnswer' => answer,
            'rubric' => rubric_as_json,
          }.compact,
        }
      end
    else
      if info['prompt'].blank?
        { 'TrueFalse' => @answer }
      else
        {
          'TrueFalse' => {
            'prompt' => unhtml(info['prompt']),
            'correctAnswer' => answer,
            'rubric' => rubric_as_json,
          }.compact,
        }
      end
    end
  end
  # rubocop:enable Naming/MethodName

  private

  def unhtml(val)
    return nil if val.blank? || (val['type'] == 'HTML' && val['value'].blank?)

    if val.is_a? Hash
      val['value']
    else
      val
    end
  end

  def unhtmls(val)
    return nil if val.nil?

    val.map { |o| unhtml(o) }
  end

  class << self
    # rubocop:disable Naming/MethodName
    def from_yaml_AllThatApply(type, options:, prompt: nil)
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          options: options.map(&:keys).flatten,
        }.compact,
        answer: options.map(&:values).flatten,
      )
    end

    def from_yaml_Code(type, initial: nil, prompt: nil, lang: nil, correct_answer: nil)
      unless initial.nil?
        if initial.key? 'file'
          # TODO, was:
          #   filename = initial['file']
          #   file = files[filename]
          #   raise "Invalid file for Code initial: #{filename}" if file.nil?
        else
          processed = MarksProcessor.process_marks(ensure_utf8(initial['code'], 'text/plain'))
          initial = {
            text: processed[:text],
            marks: processed[:marks],
          }
        end
      end
      answer = nil
      if correct_answer.is_a? String
        answer = {
          'text' => correct_answer,
          'marks' => [],
        }
      end
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          lang: lang,
          initial: initial,
        }.compact,
        answer: answer,
      )
    end

    def from_yaml_CodeTag(type, choices:, correct_answer:, prompt: nil)
      BodyItem.new(
        info: {
          type: type,
          choices: choices,
          prompt: prompt,
        }.compact,
        answer: {
          selectedFile: correct_answer['filename'],
          lineNumber: correct_answer['line'],
        },
      )
    end

    # rubocop:disable Metrics/ParameterLists
    def from_yaml_Matching(
      type,
      prompts:,
      values:,
      correct_answers:,
      prompt: nil,
      prompts_label: nil,
      values_label: nil
    )
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          promptsLabel: prompts_label,
          valuesLabel: values_label,
          prompts: prompts,
          values: values,
        }.compact,
        answer: correct_answers,
      )
    end
    # rubocop:enable Metrics/ParameterLists

    def from_yaml_MultipleChoice(type, options:, correct_answer:, prompt: nil)
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          options: options,
        }.compact,
        answer: correct_answer,
      )
    end

    def from_yaml_Text(type, entire_value: nil, prompt: nil, correct_answer: nil)
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt || entire_value.to_s,
        }.compact,
        answer: correct_answer,
      )
    end

    def from_yaml_TrueFalse(_type, entire_value: nil, prompt: nil, correct_answer: nil)
      answer =
        if [true, false].include?(entire_value)
          entire_value
        else
          correct_answer
        end
      BodyItem.new(
        info: {
          type: 'YesNo',
          yesLabel: 'True',
          noLabel: 'False',
          prompt: prompt.to_s,
        }.compact,
        answer: answer,
      )
    end

    def from_yaml_YesNo(_type, entire_value: nil, prompt: nil, correct_answer: nil)
      answer =
        if [true, false].include?(entire_value)
          entire_value
        else
          correct_answer
        end
      BodyItem.new(
        info: {
          type: 'YesNo',
          yesLabel: 'Yes',
          noLabel: 'No',
          prompt: prompt.to_s,
        }.compact,
        answer: answer,
      )
    end
    # rubocop:enable Naming/MethodName

    def ensure_utf8(str, mimetype)
      return str if ApplicationHelper.binary?(mimetype)
      return str if str.is_utf8?

      begin
        if str.dup.force_encoding(Encoding::CP1252).valid_encoding?
          str.encode(Encoding::UTF_8, Encoding::CP1252)
        else
          str.encode(Encoding::UTF_8, invalid: :replace, undef: :replace, replace: '?')
        end
      rescue RuntimeError
        str
      end
    end
  end
end
