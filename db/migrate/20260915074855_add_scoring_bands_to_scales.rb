class AddScoringBandsToScales < ActiveRecord::Migration[8.0]
  def change
    add_column :scales, :scoring_bands, :jsonb, null: false, default: []
  end
end
