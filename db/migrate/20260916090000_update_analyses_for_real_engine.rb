class UpdateAnalysesForRealEngine < ActiveRecord::Migration[8.0]
  def up
    remove_column :analyses, :results, :text
    add_column :analyses, :results, :jsonb, null: false, default: {}
    add_reference :analyses, :question_a, foreign_key: { to_table: :questions }
    add_reference :analyses, :question_b, foreign_key: { to_table: :questions }
  end

  def down
    remove_reference :analyses, :question_b, foreign_key: { to_table: :questions }
    remove_reference :analyses, :question_a, foreign_key: { to_table: :questions }
    remove_column :analyses, :results, :jsonb
    add_column :analyses, :results, :text
  end
end
