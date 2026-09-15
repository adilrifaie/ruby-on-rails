class CreateQuestions < ActiveRecord::Migration[8.0]
  def change
    create_table :questions do |t|
      t.references :scale, null: false, foreign_key: true
      t.text :text, null: false
      t.integer :position, null: false
      t.integer :min_value, null: false, default: 0
      t.integer :max_value, null: false, default: 4

      t.timestamps
    end

    add_index :questions, [ :scale_id, :position ], unique: true
  end
end
