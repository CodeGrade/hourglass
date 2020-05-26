# frozen_string_literal: true

# Mapping from timestamp to student's current answers.
class Snapshot < ApplicationRecord
  belongs_to :registration

  delegate :user, to: :registration
  delegate :exam, to: :registration

  validates :registration, presence: true
  validates :answers, presence: true
end
