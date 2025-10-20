class Analysis < ApplicationRecord
  belongs_to :survey
  belongs_to :user

  validates :analysis_type, presence: true
  
  CREDIT_COSTS = {
    'descriptive' => 5,
    'correlation' => 10,
    'factor' => 15
  }
  
  before_create :calculate_credits
  after_create :deduct_user_credits
  
  def execute_analysis
    # Basit analiz örneği
    responses = survey.responses
    self.results = "Analyzed #{responses.count} responses"
    save
  end
  
  def generate_report
    {
      survey_title: survey.title,
      analysis_type: analysis_type,
      results: results,
      total_responses: survey.response_count
    }
  end
  
  private
  
  def calculate_credits
    self.credits_used = CREDIT_COSTS[analysis_type] || 5
  end
  
  def deduct_user_credits
    user.deduct_credits(credits_used)
  end
end
