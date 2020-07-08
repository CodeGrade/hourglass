# frozen_string_literal: true

module Types
  class VersionAssignment < Types::BaseInputObject
    description 'Assignment for students to a version.'
    argument :version_id, ID, required: true, loads: Types::ExamVersionType
    argument :student_ids, [ID], required: true, loads: Types::UserType
  end
end

module Mutations
  class UpdateVersionRegistrations < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :unassigned, [ID], required: true, description: 'Students to unassign.'
    argument :versions, [Types::VersionAssignment], required: true, description: 'Version assignments to create.'

    field :exam, Types::ExamType, null: false

    def authorized?(exam:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      raise GraphQL::ExecutionError, 'You do not have permission.'
    end

    def resolve(exam:, unassigned:, versions:)
      delete_unassigned! exam, unassigned
      assign_versions! exam, versions
      {
        exam: exam,
      }
    end

    private

    def delete_unassigned!(exam, unassigned)
      unassigned.each do |user|
        student_reg = exam.registrations.find_by(user: user)
        raise GraphQL::ExecutionError, "Invalid user ID requested (#{id})" unless student_reg

        if student_reg.started?
          err = "Cannot delete registration for '#{user.display_name}' since they have already started."
          raise GraphQL::ExecutionError, err
        end
        student_reg.destroy!
      end
    end

    def assign_student!(exam, version, student)
      student_reg = exam.registrations.find_or_initialize_by(user: student)
      return if student_reg.exam_version == version

      err = "Cannot update already started student '#{student.display_name}'"
      raise GraphQL::ExecutionError, err if student_reg.started?

      student_reg.exam_version = version
      student_reg.save!
    end

    def assign_version!(exam, version, students)
      students.each do |student|
        assign_student!(exam, version, student)
      end
    end

    def assign_versions!(exam, versions)
      versions.each do |item|
        assign_version!(exam, item[:version], item[:students])
      end
    end
  end
end
