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
  status: 'draft',
  scoring_bands: [
    { 'label' => 'Minimal', 'min' => 0, 'max' => 4 },
    { 'label' => 'Mild', 'min' => 5, 'max' => 9 },
    { 'label' => 'Moderate', 'min' => 10, 'max' => 14 },
    { 'label' => 'Severe', 'min' => 15, 'max' => 20 }
  ]
)

[
  { text: 'Little interest or pleasure in doing things', position: 1 },
  { text: 'Feeling down, depressed, or hopeless', position: 2 },
  { text: 'Trouble falling or staying asleep', position: 3 },
  { text: 'Feeling tired or having little energy', position: 4 },
  { text: 'Poor appetite or overeating', position: 5 }
].each do |attrs|
  scale1.questions.create!(attrs.merge(min_value: 0, max_value: 4))
end

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
  submitted_at: Time.now,
  answers_attributes: scale1.questions.order(:position).map.with_index { |q, i| { question_id: q.id, value: i % (q.max_value + 1) } }
)

Response.create!(
  survey: survey1,
  participant_name: 'Jane Smith',
  submitted_at: Time.now,
  answers_attributes: scale1.questions.order(:position).map.with_index { |q, i| { question_id: q.id, value: (q.max_value - i) % (q.max_value + 1) } }
)

# Test analizi
Analysis.create!(
  survey: survey1,
  user: user1,
  analysis_type: 'descriptive'
)

puts "✅ Seed data created successfully!"