class Scale < ApplicationRecord
  belongs_to :user
  has_many :surveys, dependent: :destroy
  
  validates :title, presence: true
  validates :identifier, uniqueness: true
  
  before_create :generate_identifier
  
  def generate_identifier
    self.identifier = "SDP-#{Time.now.year}-#{SecureRandom.hex(4).upcase}"
  end
  
  def publish
    update(status: 'published')
  end
end
