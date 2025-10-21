# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Test kullanıcıları
user1 = User.create!(
  email: 'researcher@example.com',
  password: 'password123',
  role: 'researcher',
  credits: 100
)

user2 = User.create!(
  email: 'student@example.com',
  password: 'password123',
  role: 'student',
  credits: 50
)

# Test scale'leri
scale1 = Scale.create!(
  user: user1,
  title: 'Depression Scale',
  description: 'Measures depression levels',
  version: '1.0',
  status: 'draft'
)

scale2 = Scale.create!(
  user: user1,
  title: 'Anxiety Scale',
  description: 'Measures anxiety levels',
  version: '1.0',
  status: 'published'
)

# Test survey'leri
survey1 = Survey.create!(
  scale: scale1,
  user: user1,
  title: 'Depression Study 2025',
  status: 'active',
  response_count: 0
)

# Test response'lar
Response.create!(
  survey: survey1,
  participant_name: 'John Doe',
  answers: '1,2,3,4,5',
  submitted_at: Time.now
)

Response.create!(
  survey: survey1,
  participant_name: 'Jane Smith',
  answers: '5,4,3,2,1',
  submitted_at: Time.now
)

# Test analizi
Analysis.create!(
  survey: survey1,
  user: user1,
  analysis_type: 'descriptive'
)

puts "✅ Seed data created successfully!"