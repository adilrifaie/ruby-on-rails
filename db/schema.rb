# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_10_20_204207) do
  create_table "analyses", force: :cascade do |t|
    t.integer "survey_id", null: false
    t.integer "user_id", null: false
    t.string "analysis_type"
    t.text "results"
    t.integer "credits_used"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["survey_id"], name: "index_analyses_on_survey_id"
    t.index ["user_id"], name: "index_analyses_on_user_id"
  end

  create_table "responses", force: :cascade do |t|
    t.integer "survey_id", null: false
    t.string "participant_name"
    t.text "answers"
    t.datetime "submitted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["survey_id"], name: "index_responses_on_survey_id"
  end

  create_table "scales", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "title"
    t.text "description"
    t.string "identifier"
    t.string "version"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_scales_on_user_id"
  end

  create_table "surveys", force: :cascade do |t|
    t.integer "scale_id", null: false
    t.integer "user_id", null: false
    t.string "title"
    t.string "status"
    t.integer "response_count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["scale_id"], name: "index_surveys_on_scale_id"
    t.index ["user_id"], name: "index_surveys_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "role"
    t.integer "credits"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "analyses", "surveys"
  add_foreign_key "analyses", "users"
  add_foreign_key "responses", "surveys"
  add_foreign_key "scales", "users"
  add_foreign_key "surveys", "scales"
  add_foreign_key "surveys", "users"
end
