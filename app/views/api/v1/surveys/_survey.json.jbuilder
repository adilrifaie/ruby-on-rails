json.id survey.id
json.title survey.title
json.status survey.status
json.response_count survey.response_count
json.created_at survey.created_at
json.scale do
  json.partial! "api/v1/scales/scale", scale: survey.scale
end
json.user do
  json.partial! "api/v1/users/user", user: survey.user
end
