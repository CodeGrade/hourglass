# frozen_string_literal: true

# A body item, part of a question part.
class BodyItem < ApplicationRecord
  belongs_to :part, inverse_of: :body_items

  delegate :visible_to?, to: :part
  delegate :course, to: :part
  delegate :exam_version, to: :part
  delegate :question, to: :part

  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  accepts_nested_attributes_for :rubrics

  validate :valid_file_refs_code
  validate :valid_file_refs_code_tag

  def valid_file_refs_code
    return unless info['type'] == 'Code'
    return unless info.key? 'initial'
    return unless info['initial'].key? 'file'

    file_path = info['initial']['file']
    return if exam_version.has_file_path? file_path

    errors.add(:base, "Code initial file must be a valid exam file: '#{file_path}'")
  end

  def valid_file_refs_code_tag
    return unless info['type'] == 'CodeTag'

    file_path = answer['selectedFile']
    return if exam_version.has_file_path? file_path

    errors.add(:base, "CodeTag answer file must be a valid exam file: '#{file_path}'")
  end

  before_save do
    if rubrics.empty?
      rubrics << Rubric.new(
        exam_version: exam_version,
        question: question,
        part: part,
        body_item: self,
        type: 'None',
      )
    end
  end

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

  def as_json(format:)
    if info.is_a? String
      BodyItem.html_val(format, info)
    else
      if format == :graphql
        return {
          info: info,
          id: HourglassSchema.id_from_object(self, Types::BodyItemType, {}),
        }
      end

      send("as_json_#{info['type']}", format: format)
    end
  end

  def root_rubric
    rubrics.root_rubrics.first
  end

  def rubric_as_json(format:)
    if root_rubric.nil? || root_rubric.is_a?(None)
      nil
    else
      root_rubric.as_json(format: format).deep_stringify_keys
    end
  end

  # rubocop:disable Naming/MethodName
  def as_json_HTML(format:)
    BodyItem.html_val(format, info)
  end

  def as_json_AllThatApply(format:)
    {
      'AllThatApply' => {
        'prompt' => BodyItem.html_val(format, info['prompt']),
        'options' => info['options'].zip(answer).map do |opt, ans|
          { BodyItem.html_val(format, opt) => ans }
        end,
        'rubric' => rubric_as_json(format: format),
      }.compact,
    }
  end

  def as_json_Code(format:)
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
        'prompt' => BodyItem.html_val(format, info['prompt']),
        'lang' => BodyItem.html_val(format, info['lang']),
        'initial' => initial,
        'correctAnswer' =>
          if answer.blank? || answer['text'].blank?
            nil
          else
            MarksProcessor.process_marks_reverse(answer['text'], answer['marks'])
          end,
        'rubric' => rubric_as_json(format: format),
      }.compact,
    }
  end

  def as_json_CodeTag(format:)
    {
      'CodeTag' => {
        'prompt' => BodyItem.html_val(format, info['prompt']),
        'choices' => BodyItem.html_val(format, info['choices']),
        'correctAnswer' => {
          'filename' => answer['selectedFile'],
          'line' => answer['lineNumber'],
        },
        'rubric' => rubric_as_json(format: format),
      }.compact,
    }
  end

  def as_json_Matching(format:)
    {
      'Matching' => {
        'prompt' => BodyItem.html_val(format, info['prompt']),
        'promptsLabel' => BodyItem.html_val(format, info['promptsLabel']),
        'valuesLabel' => BodyItem.html_val(format, info['valuesLabel']),
        'prompts' => BodyItem.html_vals(format, info['prompts']),
        'values' => BodyItem.html_vals(format, info['values']),
        'correctAnswers' => answer,
        'rubric' => rubric_as_json(format: format),
      }.compact,
    }
  end

  def as_json_MultipleChoice(format:)
    {
      'MultipleChoice' => {
        'prompt' => BodyItem.html_val(format, info['prompt']),
        'options' => BodyItem.html_vals(format, info['options']),
        'correctAnswer' => answer,
        'rubric' => rubric_as_json(format: format),
      }.compact,
    }
  end

  def as_json_Text(format:)
    {
      'Text' => {
        'prompt' => BodyItem.html_val(format, info['prompt']),
        'correctAnswer' =>
          if answer.is_a? String
            answer
          else
            BodyItem.html_val(format, answer&.dig('text'))
          end,
        'rubric' => rubric_as_json(format: format),
      }.compact,
    }
  end

  def as_json_YesNo(format:)
    case info['yesLabel']
    when 'Yes'
      if info['prompt'].blank?
        { 'YesNo' => answer }
      else
        {
          'YesNo' => {
            'prompt' => BodyItem.html_val(format, info['prompt']),
            'correctAnswer' => answer,
            'rubric' => rubric_as_json(format: format),
          }.compact,
        }
      end
    else
      if info['prompt'].blank?
        { 'TrueFalse' => @answer }
      else
        {
          'TrueFalse' => {
            'prompt' => BodyItem.html_val(format, info['prompt']),
            'correctAnswer' => answer,
            'rubric' => rubric_as_json(format: format),
          }.compact,
        }
      end
    end
  end
  # rubocop:enable Naming/MethodName

  class << self
    def html_val(format, val)
      if format == :graphql
        return nil if val.blank? || (val['type'] == 'HTML' && val['value'].blank?)

        if val.is_a? Hash
          val
        else
          {
            type: 'HTML',
            value: val,
          }
        end
      else
        if val.is_a? Hash # rubocop:disable Style/IfInsideElse
          val['value']
        else
          val
        end
      end
    end

    def html_vals(format, val)
      return nil if val.nil?

      val.map { |o| html_val(format, o) }
    end

    # rubocop:disable Naming/MethodName
    def from_yaml_AllThatApply(type, options:, prompt: nil)
      BodyItem.new(
        info: {
          type: type,
          prompt: html_val(:graphql, prompt),
          options: html_vals(:graphql, options.map(&:keys).flatten),
        }.compact,
        answer: options.map(&:values).flatten,
      )
    end

    def from_yaml_Code(type, initial: nil, prompt: nil, lang: nil, correct_answer: nil)
      unless initial.nil?
        if initial.key? 'file'
          # We check file validity in the BodyItem model
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
          prompt: html_val(:graphql, prompt),
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
          prompt: html_val(:graphql, prompt),
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
          prompt: html_val(:graphql, prompt),
          promptsLabel: html_val(:graphql, prompts_label),
          valuesLabel: html_val(:graphql, values_label),
          prompts: html_vals(:graphql, prompts),
          values: html_vals(:graphql, values),
        }.compact,
        answer: correct_answers,
      )
    end
    # rubocop:enable Metrics/ParameterLists

    def from_yaml_MultipleChoice(type, options:, correct_answer:, prompt: nil)
      BodyItem.new(
        info: {
          type: type,
          prompt: html_val(:graphql, prompt),
          options: html_vals(:graphql, options),
        }.compact,
        answer: correct_answer,
      )
    end

    def from_yaml_Text(type, entire_value: nil, prompt: nil, correct_answer: nil)
      BodyItem.new(
        info: {
          type: type,
          prompt: html_val(:graphql, prompt || entire_value.to_s),
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
          prompt: html_val(:graphql, prompt.to_s),
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
          prompt: html_val(:graphql, prompt.to_s),
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
