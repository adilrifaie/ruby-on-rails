class User < ApplicationRecord
    has_secure_password
  
    has_many :scales, dependent: :destroy
    has_many :surveys, dependent: :destroy
    has_many :analyses, dependent: :destroy
  
    validates :email, presence: true, uniqueness: true
    validates :role, inclusion: { in: %w[admin researcher student] }
    validates :credits, numericality: { greater_than_or_equal_to: 0 }
  
    def deduct_credits(amount)
        update(credits: credits - amount) if credits >= amount
    end
end
