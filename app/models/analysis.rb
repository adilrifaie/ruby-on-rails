class Analysis < ApplicationRecord
  belongs_to :survey
  belongs_to :user
  belongs_to :question_a, class_name: 'Question', optional: true
  belongs_to :question_b, class_name: 'Question', optional: true

  validates :analysis_type, presence: true, inclusion: { in: %w[descriptive correlation factor] }
  validate :correlation_requires_two_questions
  validate :sufficient_credits, on: :create

  CREDIT_COSTS = {
    'descriptive' => 5,
    'correlation' => 10,
    'factor' => 15
  }

  before_create :calculate_credits
  after_create :deduct_user_credits

  def execute_analysis
    self.results = case analysis_type
    when 'descriptive'
      Analyses::DescriptiveStats.new(survey).call
    when 'correlation'
      Analyses::Correlation.new(survey, question_a, question_b).call
    when 'factor'
      Analyses::FactorSummary.new(survey).call
    end

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

  def correlation_requires_two_questions
    return unless analysis_type == 'correlation'

    errors.add(:question_a, "and question_b are required for a correlation analysis") if question_a.nil? || question_b.nil?
  end

  def sufficient_credits
    return unless user

    cost = CREDIT_COSTS[analysis_type] || 5
    errors.add(:credits, "are insufficient: this analysis costs #{cost} credits, you have #{user.credits}") if user.credits < cost
  end

  def calculate_credits
    self.credits_used = CREDIT_COSTS[analysis_type] || 5
  end

  def deduct_user_credits
    user.deduct_credits(credits_used)
  end
end
