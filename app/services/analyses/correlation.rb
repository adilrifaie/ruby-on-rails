module Analyses
  class Correlation
    def initialize(survey, question_a, question_b)
      @survey = survey
      @question_a = question_a
      @question_b = question_b
    end

    def call
      pairs = paired_values

      {
        question_a_id: @question_a.id,
        question_b_id: @question_b.id,
        n: pairs.size,
        coefficient: pairs.size >= 2 ? pearson(pairs).round(4) : nil
      }
    end

    private

    def paired_values
      answers_a = Answer.where(question: @question_a, response: @survey.responses).index_by(&:response_id)
      answers_b = Answer.where(question: @question_b, response: @survey.responses).index_by(&:response_id)

      (answers_a.keys & answers_b.keys).map { |response_id| [ answers_a[response_id].value, answers_b[response_id].value ] }
    end

    def pearson(pairs)
      xs = pairs.map(&:first)
      ys = pairs.map(&:last)
      n = pairs.size

      mean_x = xs.sum.to_f / n
      mean_y = ys.sum.to_f / n

      covariance = pairs.sum { |x, y| (x - mean_x) * (y - mean_y) }
      std_x = Math.sqrt(xs.sum { |x| (x - mean_x)**2 })
      std_y = Math.sqrt(ys.sum { |y| (y - mean_y)**2 })

      return 0.0 if std_x.zero? || std_y.zero?

      covariance / (std_x * std_y)
    end
  end
end
