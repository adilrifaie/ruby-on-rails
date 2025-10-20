class Response < ApplicationRecord
  belongs_to :survey

  validates :participant_name, presence: true
  validates :answers, presence: true
  
  after_create :update_survey_count
  
  def calculate_score
    # Basit skor hesaplama örneği
    answers.to_s.scan(/\d+/).map(&:to_i).sum
  end
  
  def export_data
    {
      participant: participant_name,
      answers: answers,
      score: calculate_score,
      submitted_at: submitted_at
    }
  end
  
  private
  
  def update_survey_count
    survey.increment_responses
  end
end
