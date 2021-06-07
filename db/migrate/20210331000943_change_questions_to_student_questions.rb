class ChangeQuestionsToStudentQuestions < ActiveRecord::Migration[6.0]
  def change
    rename_table "questions", "student_questions"
  end
end
