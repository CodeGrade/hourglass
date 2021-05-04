# frozen_string_literal: true

# A body item, part of a question part.
class BodyItem < ApplicationRecord
  belongs_to :part

  delegate :visible_to?, to: :part
  delegate :course, to: :part

  has_many :rubrics, dependent: :destroy
  has_many :rubric_presets, through: :rubrics
  has_many :preset_comments, through: :rubric_presets

  # TODO: validate answer with JSON schema

  def self.inheritance_column
    nil
  end

  def self.from_yaml(type, rest)
    if rest.is_a? Hash
      self.send("from_yaml_#{type}", type, **(rest.symbolize_keys))
    else
      self.send("from_yaml_#{type}", type, entireValue: rest)
    end
  rescue NoMethodError
    raise "Bad body item type: #{type}."
  end

  private

  class << self

    def from_yaml_AllThatApply(type, prompt: nil, options:)
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          options: options.map(&:keys).flatten,
        }.compact,
        answer: options.map(&:values).flatten,
      )
    end

    def from_yaml_Code(type, initial: nil, prompt: nil, lang: nil, correctAnswer: nil)
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
      if correctAnswer.is_a? String
        answer = {
          'text' => correctAnswer,
          'marks' => [],
        }
      end
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          lang: lang,
          intial: initial,
        }.compact,
        answer: answer,
      )
    end

    def from_yaml_CodeTag(type, choices:, prompt: nil, correctAnswer:)
      BodyItem.new(
        info: {
          type: type,
          choices: choices,
          prompt: prompt,
        }.compact,
        answer: {
          selectedFile: correctAnswer['filename'],
          lineNumber: correctAnswer['line'],
        },
      )
    end

    def from_yaml_Matching(type, prompt: nil, promptsLabel: nil, valuesLabel: nil, prompts:, values:, correctAnswers:)
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          promptsLabel: promptsLabel,
          valuesLabel: valuesLabel,
          prompts: prompts,
          values: values,
        }.compact,
        answer: correctAnswers,
      )
    end

    def from_yaml_MultipleChoice(type, prompt: nil, options:, correctAnswer:)
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt,
          options: options,
        }.compact,
        answer: correctAnswer,
      )
    end

    def from_yaml_Text(type, entireValue: nil, prompt: nil, correctAnswer: nil)
      BodyItem.new(
        info: {
          type: type,
          prompt: prompt || entireValue.to_s,
        }.compact,
        answer: correctAnswer,
      )
    end

    def from_yaml_TrueFalse(type, entireValue: nil, prompt: nil, correctAnswer: nil)
      answer =
        if entireValue == true || entireValue == false
          entireValue
        else
          correctAnswer
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

    def from_yaml_YesNo(type, entireValue: nil, prompt: nil, correctAnswer: nil)
      answer =
        if entireValue == true || entireValue == false
          entireValue
        else
          correctAnswer
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
  end
end
