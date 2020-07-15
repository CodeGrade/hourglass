module Types
  class HtmlTag < Types::BaseEnum
    value 'HTML'
  end
  class HtmlType < Types::BaseObject
    field :type, HtmlTag, null: false
    field :value, String, null: false
  end
end
