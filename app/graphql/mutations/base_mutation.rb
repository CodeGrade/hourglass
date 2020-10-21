# frozen_string_literal: true

module Mutations
  # The base class of Hourglass-specific mutations
  class BaseMutation < GraphQL::Schema::RelayClassicMutation
    argument_class Types::BaseArgument
    field_class Types::BaseField
    input_object_class Types::BaseInputObject
    object_class Types::BaseObject

    def cache_authorization!(exam, course)
      exam_role = Exam.roles[:no_reg]
      course_role = Exam.roles[:no_reg]
      if course.user_is_professor?(context[:current_user])
        course_role = exam_role = Exam.roles[:professor]
      elsif exam&.user_is_proctor?(context[:current_user].id)
        exam_role = Exam.roles[:proctor]
        course_role = Exam.roles[:staff]
      elsif course.user_is_staff?(context[:current_user])
        course_role = Exam.roles[:staff]
      elsif course.user_is_student?(context[:current_user])
        course_role = Exam.roles[:student]
      end
      ac = context[:access_cache]
      ac[:role_for_exam] = {} unless ac.key? :role_for_exam
      ac[:role_for_exam][context[:current_user].id] = exam_role
      ac[:role_for_course] = {} unless ac.key? :role_for_course
      ac[:role_for_course][context[:current_user].id] = course_role
    end

    def lookup_ids(ids)
      HourglassSchema.objects_from_ids(ids, context)
    end 
  end
end
