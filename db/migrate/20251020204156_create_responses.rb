class CreateResponses < ActiveRecord::Migration[8.0]
  def change
    create_table :responses do |t|
      t.references :survey, null: false, foreign_key: true
      t.string :participant_name
      t.text :answers
      t.datetime :submitted_at

      t.timestamps
    end
  end
end
