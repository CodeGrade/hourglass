# frozen_string_literal: true

# A body item, part of a question part.
class BodyItem < ApplicationRecord
  belongs_to :part

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
      self.send("from_yaml_#{type}", type, **(rest.symbolize_keys))
    else
      self.send("from_yaml_#{type}", type, entireValue: rest)
    end
  rescue NoMethodError => e
    raise "Bad body item type: #{type}: #{e}."
  end

  def as_json
    if info.is_a? String
      info
    else
      root_rubric = rubrics.find_by(order: nil)
      rubric_as_json = if root_rubric.nil? || root_rubric.is_a?(None)
        nil
      else
        root_rubric.as_json(nil, true).deep_stringify_keys
      end
      case info['type']
      when 'HTML'
        info['value']
      when 'AllThatApply'
        {
          'AllThatApply' => {
            'prompt' => unhtml(info['prompt']),
            'options' => info['options'].zip(answer).map do |opt, ans|
              { unhtml(opt) => ans }
            end,
            'rubric' => rubric_as_json,
          }.compact
        }
      when 'Code'
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
              if answer.blank? || answer.dig("text").blank?
                nil
              else
                MarksProcessor.process_marks_reverse(answer['text'], answer['marks'])
              end,
            'rubric' => rubric_as_json,
          }.compact
        }
      when 'CodeTag'
        {
          'CodeTag' => {
            'prompt' => unhtml(info['prompt']),
            'choices' => unhtml(info['choices']),
            'correctAnswer' => {
              'filename' => answer['selectedFile'],
              'line' => answer['lineNumber'],
            },
            'rubric' => rubric_as_json,
          }.compact
        }
      when 'Matching'
        {
          'Matching' => {
            'prompt' => unhtml(info['prompt']),
            'promptsLabel' => unhtml(info['promptsLabel']),
            'valuesLabel' => unhtml(info['valuesLabel']),
            'prompts' => unhtmls(info['prompts']),
            'values' => unhtmls(info['values']),
            'correctAnswers' => answer,
            'rubric' => rubric_as_json,
          }.compact
        }
      when 'MultipleChoice'
        {
          'MultipleChoice' => {
            'prompt' => unhtml(info['prompt']),
            'options' => unhtmls(info['options']),
            'correctAnswer' => answer,
            'rubric' => rubric_as_json,
          }.compact
        }
      when 'Text'
        {
          'Text' => {
            'prompt' => unhtml(info['prompt']),
            'correctAnswer' => unhtml(answer&.dig("text")),
            'rubric' => rubric_as_json,
          }.compact
        }
      when 'YesNo'
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
              }.compact
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
              }.compact
            }
          end
        end
      end
    end
  end

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
