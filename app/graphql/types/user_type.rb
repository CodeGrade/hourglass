# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    field :username, String, null: false
    field :display_name, String, null: false
    field :nuid, Integer, null: true
    field :email, String, null: false
    field :image_url, String, null: true
    def image_url
      object.full_bottlenose_image_url
    end
    field :admin, Boolean, null: false

    field :is_me, Boolean, null: false
    def is_me
      object == context[:current_user]
    end

    field :role, Types::CourseRoleType, null: false do
      argument :course_id, ID, required: false
      argument :exam_id, ID, loads: Types::ExamType, required: false
    end
    def role(course_id: nil, exam: nil)
      if course_id
        if context[:current_user].professor_course_registrations.find{|r| r.course_id == course_id}
          :professor
        elsif context[:current_user].proctor_registrations.includes(:course).find{|r| r.course.id == course_id}
          :proctor
        elsif context[:current_user].student_registrations.includes(:course).find{|r| r.course.id == course_id}
          :student
        else
          :none
        end
      elsif exam
        if context[:current_user].professor_course_registrations.find{|r| r.course_id == exam.course_id}
          :professor
        elsif context[:current_user].proctor_registrations.find{|r| r.exam_id == exam.id}
          :proctor
        elsif context[:current_user].registrations.includes(:exam).find{|r| r.exam_id == exam.id}
          :student
        else
          :none
        end
      else
        :none
      end
    end
  end
end
