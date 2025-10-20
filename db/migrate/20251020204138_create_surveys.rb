class CreateSurveys < ActiveRecord::Migration[8.0]
  def change
    create_table :surveys do |t|
      t.references :scale, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.string :status
      t.integer :response_count

      t.timestamps
    end
  end
end
