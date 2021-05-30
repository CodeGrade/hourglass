# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :grade_next, mutation: Mutations::GradeNext
    field :stop_impersonating, mutation: Mutations::StopImpersonating
    field :impersonate_user, mutation: Mutations::ImpersonateUser
    
    field :commence_grading, mutation: Mutations::CommenceGrading
    field :acquire_grading_lock, mutation: Mutations::AcquireGradingLock
    field :release_grading_lock, mutation: Mutations::ReleaseGradingLock
    field :release_all_grading_locks, mutation: Mutations::ReleaseAllGradingLocks
    
    # field :create_grading_check, mutation: Mutations::CreateGradingCheck
    field :create_grading_comment, mutation: Mutations::CreateGradingComment
    field :update_grading_comment, mutation: Mutations::UpdateGradingComment
    field :destroy_grading_comment, mutation: Mutations::DestroyGradingComment
    
    field :ask_question, mutation: Mutations::AskQuestion
    field :destroy_exam_version, mutation: Mutations::DestroyExamVersion
    field :update_exam_version, mutation: Mutations::UpdateExamVersion
    field :create_exam_version, mutation: Mutations::CreateExamVersion
    field :change_exam_version_details, mutation: Mutations::ChangeExamVersionDetails
    field :sync_course_to_bottlenose, mutation: Mutations::SyncCourseToBottlenose
    field :sync_exam_to_bottlenose, mutation: Mutations::SyncExamToBottlenose
    field :update_student_seating, mutation: Mutations::UpdateStudentSeating
    field :update_staff_seating, mutation: Mutations::UpdateStaffSeating
    field :update_exam_rooms, mutation: Mutations::UpdateExamRooms
    field :update_version_registrations, mutation: Mutations::UpdateVersionRegistrations
    field :destroy_accommodation, mutation: Mutations::DestroyAccommodation
    field :update_accommodation, mutation: Mutations::UpdateAccommodation
    field :create_accommodation, mutation: Mutations::CreateAccommodation
    field :create_exam, mutation: Mutations::CreateExam
    field :finalize_item, mutation: Mutations::FinalizeItem
    field :send_message, mutation: Mutations::SendMessage
    field :destroy_anomaly, mutation: Mutations::DestroyAnomaly
    field :update_exam, mutation: Mutations::UpdateExam
    
    field :publish_grades, mutation: Mutations::PublishGrades
    field :request_grading_lock, mutation: Mutations::RequestGradingLock
    
    field :create_rubric, mutation: Mutations::CreateRubric
    field :change_rubric_type, mutation: Mutations::ChangeRubricTypeType
    field :change_rubric_details, mutation: Mutations::ChangeRubricDetails
    field :reorder_rubrics, mutation: Mutations::ReorderRubrics
    field :destroy_rubric, mutation: Mutations::DestroyRubric
    
    field :create_rubric_preset, mutation: Mutations::CreateRubricPreset
    field :change_rubric_preset_details, mutation: Mutations::ChangeRubricPresetDetails
    
    field :create_preset_comment, mutation: Mutations::CreatePresetComment
    field :change_preset_comment_details, mutation: Mutations::ChangePresetCommentDetails
    field :reorder_preset_comments, mutation: Mutations::ReorderPresetComments
    field :destroy_preset_comment, mutation: Mutations::DestroyPresetComment
    
    field :create_question, mutation: Mutations::CreateQuestion
    field :reorder_questions, mutation: Mutations::ReorderQuestions
    field :change_question_details, mutation: Mutations::ChangeQuestionDetails
    field :destroy_question, mutation: Mutations::DestroyQuestion
    
    field :create_part, mutation: Mutations::CreatePart
    field :reorder_parts, mutation: Mutations::ReorderParts
    field :change_part_details, mutation: Mutations::ChangePartDetails
    field :destroy_part, mutation: Mutations::DestroyPart
    
    field :reorder_body_items, mutation: Mutations::ReorderBodyItems
    field :destroy_body_item, mutation: Mutations::DestroyBodyItem
    
    field :create_code, mutation: Mutations::CreateCode
    field :change_code_details, mutation: Mutations::ChangeCodeDetails
    
    field :create_all_that_apply, mutation: Mutations::CreateAllThatApply
    field :change_all_that_apply_details, mutation: Mutations::ChangeAllThatApplyDetails
    
    field :create_multiple_choice, mutation: Mutations::CreateMultipleChoice
    field :change_multiple_choice_details, mutation: Mutations::ChangeMultipleChoiceDetails
    
    field :create_matching, mutation: Mutations::CreateMatching
    field :change_matching_details, mutation: Mutations::ChangeMatchingDetails
    
    field :create_yes_no, mutation: Mutations::CreateYesNo
    field :change_yes_no_details, mutation: Mutations::ChangeYesNoDetails
    
    field :create_text, mutation: Mutations::CreateText
    field :change_text_details, mutation: Mutations::ChangeTextDetails
    
    field :create_code_tag, mutation: Mutations::CreateCodeTag
    field :change_code_tag_details, mutation: Mutations::ChangeCodeTagDetails
    
    field :create_html, mutation: Mutations::CreateHtml
    field :change_html_details, mutation: Mutations::ChangeHtmlDetails
    

    field :move_body_item_answer, mutation: Mutations::MoveBodyItemAnswer
  end
end
