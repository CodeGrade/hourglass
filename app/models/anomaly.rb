class Anomaly < ApplicationRecord
  belongs_to :registration

  validates :registration, presence: true

  delegate :user, to: :registration
  delegate :exam, to: :registration
end
