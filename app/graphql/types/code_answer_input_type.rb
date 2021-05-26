module Types
  class SrclocInputType < Types::BaseInputObject
    argument :line, Integer, required: true
    argument :ch, Integer, required: true
    argument :sticky, String, required: false

    def prepare
      {
        line: line,
        ch: ch,
        sticky: sticky
      }.compact
    end
  end

  class MarkOptionsInputType < Types::BaseInputObject
    argument :inclusive_left, Boolean, required: false
    argument :inclusive_right, Boolean, required: false

    def prepare
      {
        inclusiveLeft: inclusive_left,
        inclusiveRight: inclusive_right,
      }.compact
    end
  end

  class MarkInputType < Types::BaseInputObject
    argument :from, SrclocInputType, required: true
    argument :to, SrclocInputType, required: true
    argument :options, MarkOptionsInputType, required: true

    def prepare
      {
        from: from,
        to: to,
        options: options,
      }
    end
  end

  class CodeAnswerInputType < Types::BaseInputObject
    argument :text, String, required: false
    argument :marks, [MarkInputType], required: true

    def prepare
      {
        text: text,
        marks: marks,
      }
    end
  end
end
