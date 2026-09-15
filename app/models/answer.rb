class Answer < ApplicationRecord
  belongs_to :response
  belongs_to :question

  validates :value, presence: true, numericality: { only_integer: true }
  validates :question_id, uniqueness: { scope: :response_id }
  validate :value_within_question_range

  private

  def value_within_question_range
    return if value.nil? || question.nil?

    unless (question.min_value..question.max_value).cover?(value)
      errors.add(:value, "must be between #{question.min_value} and #{question.max_value}")
    end
  end
end
