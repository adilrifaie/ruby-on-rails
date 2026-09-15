class Question < ApplicationRecord
  belongs_to :scale
  has_many :answers, dependent: :destroy

  validates :text, presence: true
  validates :position, presence: true, uniqueness: { scope: :scale_id }
  validates :min_value, :max_value, presence: true, numericality: { only_integer: true }
  validate :max_value_greater_than_min_value

  private

  def max_value_greater_than_min_value
    return if min_value.nil? || max_value.nil?

    errors.add(:max_value, "must be greater than min_value") if max_value <= min_value
  end
end
