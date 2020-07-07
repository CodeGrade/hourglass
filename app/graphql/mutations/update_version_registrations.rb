# frozen_string_literal: true

module Types
  class VersionAssignment < Types::BaseInputObject
    description 'Assignment for students to a version.'
    argument :version_id, Integer, required: true
    argument :student_ids, [Integer], required: true
  end
end

module Mutations
  class UpdateVersionRegistrations < BaseMutation
    argument :exam_id, ID, required: true, loads: Types::ExamType
    argument :unassigned, [Integer], required: true, description: 'Students to unassign.'
    argument :versions, [Types::VersionAssignment], required: true, description: 'Version assignments to create.'

    field :exam, Types::ExamType, null: false

    def authorized?(exam:, **_args)
      return true if ProfessorCourseRegistration.find_by(
        user: context[:current_user],
        course: exam.course,
      )

      [false, { errors: ['You do not have permission.'] }]
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
      unassigned.each do |id|
        user = exam.course.students.find { |u| u.id == id }
        raise "Invalid user ID requested (#{id})" if user.nil?

        student_reg = exam.registrations.find_by(user_id: id)
        next unless student_reg

        if student_reg.started?
          err = "Cannot delete registration for '#{user.display_name}' since they have already started."
          raise GraphQL::ExecutionError, err
        end
        student_reg.destroy!
      end
    end

    def assign_student!(exam, version_id, student_id)
      user = exam.course.students.find { |u| u.id == student_id }
      raise "Invalid student ID requested (#{student_id})" if user.nil?

      student_reg = exam.registrations.find_or_initialize_by(user: user)
      return if student_reg.exam_version_id == version_id

      raise "Cannot update already started student '#{user.display_name}'" if student_reg.started?

      student_reg.exam_version_id = version_id
      student_reg.save!
    end

    def assign_version!(exam, version_id, student_ids)
      student_ids.each do |id|
        assign_student!(exam, version_id, id)
      end
    end

    def assign_versions!(exam, versions)
      versions.each do |item|
        assign_version!(exam, item[:version_id], item[:student_ids])
      end
    end
  end
end
