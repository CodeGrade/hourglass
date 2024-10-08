# frozen_string_literal: true

module Types
  class CourseRoleType < Types::BaseEnum
    value 'NONE', value: :none
    value 'STUDENT', value: :student
    value 'STAFF', value: :staff
    value 'PROCTOR', value: :proctor
    value 'PROFESSOR', value: :professor
  end
end
