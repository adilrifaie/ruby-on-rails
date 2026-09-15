module Analyses
  # Intentionally lightweight: per-question average/min/max across all
  # responses, not a real factor analysis (no eigenvalues/loadings).
  class FactorSummary
    def initialize(survey)
      @survey = survey
    end

    def call
      questions = @survey.scale.questions.order(:position)

      {
        note: "Simplified grouping summary, not a statistical factor analysis",
        questions: questions.map { |question| question_summary(question) }
      }
    end

    private

    def question_summary(question)
      values = Answer.where(question: question, response: @survey.responses).pluck(:value)

      {
        question_id: question.id,
        text: question.text,
        n: values.size,
        average: values.empty? ? nil : (values.sum.to_f / values.size).round(2),
        min: values.min,
        max: values.max
      }
    end
  end
end
