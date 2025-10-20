class CreateScales < ActiveRecord::Migration[8.0]
  def change
    create_table :scales do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.string :identifier
      t.string :version
      t.string :status

      t.timestamps
    end
  end
end
