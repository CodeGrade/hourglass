module Types
  class HtmlInputType < Types::BaseInputObject
    argument :type, Types::HtmlTag, required: true
    argument :value, String, required: true

    def prepare
      {
        type: type,
        value: value
      }
    end
  end
end
