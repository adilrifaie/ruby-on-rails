class CreateAnalyses < ActiveRecord::Migration[8.0]
  def change
    create_table :analyses do |t|
      t.references :survey, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :analysis_type
      t.text :results
      t.integer :credits_used

      t.timestamps
    end
  end
end
