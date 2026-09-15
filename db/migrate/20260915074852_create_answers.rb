class CreateAnswers < ActiveRecord::Migration[8.0]
  def change
    create_table :answers do |t|
      t.references :response, null: false, foreign_key: true
      t.references :question, null: false, foreign_key: true
      t.integer :value, null: false

      t.timestamps
    end

    add_index :answers, [ :response_id, :question_id ], unique: true
  end
end
