json.id response.id
json.survey_id response.survey_id
json.participant_name response.participant_name
json.submitted_at response.submitted_at
json.score response.calculate_score
json.severity_band response.severity_band
json.answers response.answers do |answer|
  json.question_id answer.question_id
  json.value answer.value
end
