class Response < ApplicationRecord
  belongs_to :survey
  has_many :answers, dependent: :destroy
  accepts_nested_attributes_for :answers

  validates :participant_name, presence: true
  validate :one_answer_per_question

  after_create :update_survey_count

  def calculate_score
    answers.sum(:value)
  end

  def severity_band
    survey.scale.scoring_bands.find do |band|
      calculate_score.between?(band["min"], band["max"])
    end
  end

  def export_data
    {
      participant: participant_name,
      answers: answers.map { |answer| { question_id: answer.question_id, value: answer.value } },
      score: calculate_score,
      severity_band: severity_band,
      submitted_at: submitted_at
    }
  end

  private

  def one_answer_per_question
    question_ids = answers.reject(&:marked_for_destruction?).map(&:question_id)
    errors.add(:answers, "must have exactly one answer per question") if question_ids.uniq.length != question_ids.length
  end

  def update_survey_count
    survey.increment_responses
  end
end
