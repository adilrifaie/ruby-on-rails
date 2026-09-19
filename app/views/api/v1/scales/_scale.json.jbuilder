json.id scale.id
json.title scale.title
json.description scale.description
json.identifier scale.identifier
json.version scale.version
json.status scale.status
json.scoring_bands scale.scoring_bands || []
json.created_at scale.created_at
json.user do
  json.partial! "api/v1/users/user", user: scale.user
end
