class RemoveAnswersFromResponses < ActiveRecord::Migration[8.0]
  def change
    remove_column :responses, :answers, :text
  end
end
