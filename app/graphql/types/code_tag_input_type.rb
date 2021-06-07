module Types
  class CodeTagInputType < Types::BaseInputObject
    argument :line_number, Integer, required: true
    argument :selected_file, String, required: false

    def prepare
      {
        lineNumber: line_number,
        selectedFile: selected_file
      }.compact
    end
  end
end
