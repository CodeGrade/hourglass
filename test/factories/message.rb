# frozen_string_literal: true

FactoryBot.define do
  factory :message do
    transient do
      # rubocop:disable FactoryBot/FactoryAssociationWithStrategy
      # Need the professor to be fully created and saved, so that
      # exam.proctors_and_professors can find it later during validation
      prof_reg { create(:professor_course_registration, course: registration.exam.course) }
      # rubocop:enable FactoryBot/FactoryAssociationWithStrategy
    end

    sender { prof_reg.user }
    registration
    body { 'Read the directions for that question more carefully..' }
  end
end
