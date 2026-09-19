class Scale < ApplicationRecord
  belongs_to :user
  has_many :surveys, dependent: :destroy
  has_many :questions, -> { order(:position) }, dependent: :destroy

  validates :title, presence: true
  validates :identifier, uniqueness: true
  validate :scoring_bands_are_well_formed
  validate :scoring_bands_locked_once_published

  before_create :generate_identifier

  def generate_identifier
    self.identifier = "SDP-#{Time.now.year}-#{SecureRandom.hex(4).upcase}"
  end

  def publish
    update(status: 'published')
  end

  # Published scales are locked: their questions and scoring bands can't change, so every
  # response to the scale is scored against the same instrument.
  def published?
    status == "published"
  end

  private

  # Each band is {"label" => String, "min" => Integer, "max" => Integer}, min <= max, no overlaps.
  def scoring_bands_are_well_formed
    bands = scoring_bands || []
    return errors.add(:scoring_bands, "must be a list") unless bands.is_a?(Array)

    bands.each_with_index do |band, index|
      label, min, max = band["label"], band["min"], band["max"]
      errors.add(:scoring_bands, "band #{index + 1} needs a label") if label.to_s.strip.empty?
      unless min.is_a?(Integer) && max.is_a?(Integer)
        errors.add(:scoring_bands, "band #{index + 1} needs whole-number min and max scores")
        next
      end
      errors.add(:scoring_bands, "band #{index + 1} has a min score above its max score") if min > max
    end
    return if errors.include?(:scoring_bands)

    bands.sort_by { |band| band["min"] }.each_cons(2) do |lower, upper|
      if upper["min"] <= lower["max"]
        errors.add(:scoring_bands, "“#{lower['label']}” and “#{upper['label']}” overlap")
      end
    end
  end

  def scoring_bands_locked_once_published
    return unless will_save_change_to_scoring_bands? && status_in_database == "published"

    errors.add(:scoring_bands, "can't be changed after the scale is published")
  end
end
