json.survey do
  json.partial! "survey", survey: @survey
end
json.link @survey.generate_link
