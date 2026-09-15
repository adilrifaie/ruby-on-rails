module Analyses
  class DescriptiveStats
    def initialize(survey)
      @survey = survey
    end

    def call
      scores = @survey.responses.includes(:answers).map(&:calculate_score)
      n = scores.size

      return { n: 0, mean: nil, median: nil, std_dev: nil, min: nil, max: nil } if n.zero?

      mean = scores.sum.to_f / n

      {
        n: n,
        mean: mean.round(2),
        median: median(scores),
        std_dev: std_dev(scores, mean).round(2),
        min: scores.min,
        max: scores.max
      }
    end

    private

    def median(scores)
      sorted = scores.sort
      mid = sorted.size / 2
      sorted.size.odd? ? sorted[mid].to_f : (sorted[mid - 1] + sorted[mid]) / 2.0
    end

    def std_dev(scores, mean)
      return 0.0 if scores.size < 2

      variance = scores.sum { |score| (score - mean)**2 } / (scores.size - 1).to_f
      Math.sqrt(variance)
    end
  end
end
