class Survey < ApplicationRecord
  belongs_to :scale
  belongs_to :user
  has_many :responses, dependent: :destroy
  has_many :analyses, dependent: :destroy
  
  validates :title, presence: true
  
  def generate_link
    "https://scale-platform.com/surveys/#{id}"
  end
  
  def increment_responses
    increment!(:response_count)
  end
end
