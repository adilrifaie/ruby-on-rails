json.partial! "scale", scale: @scale
json.questions @scale.questions.order(:position) do |question|
  json.partial! "api/v1/questions/question", question: question
end
