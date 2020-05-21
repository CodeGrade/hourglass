class Anomaly < ApplicationRecord
  belongs_to :registration

  delegate :user, to: :registration
  delegate :exam, to: :registration
end
