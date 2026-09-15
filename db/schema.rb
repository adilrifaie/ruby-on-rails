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

ActiveRecord::Schema[8.0].define(version: 2026_09_16_090000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "analyses", force: :cascade do |t|
    t.integer "survey_id", null: false
    t.integer "user_id", null: false
    t.string "analysis_type"
    t.integer "credits_used"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "results", default: {}, null: false
    t.bigint "question_a_id"
    t.bigint "question_b_id"
    t.index ["question_a_id"], name: "index_analyses_on_question_a_id"
    t.index ["question_b_id"], name: "index_analyses_on_question_b_id"
    t.index ["survey_id"], name: "index_analyses_on_survey_id"
    t.index ["user_id"], name: "index_analyses_on_user_id"
  end

  create_table "answers", force: :cascade do |t|
    t.bigint "response_id", null: false
    t.bigint "question_id", null: false
    t.integer "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["question_id"], name: "index_answers_on_question_id"
    t.index ["response_id", "question_id"], name: "index_answers_on_response_id_and_question_id", unique: true
    t.index ["response_id"], name: "index_answers_on_response_id"
  end

  create_table "questions", force: :cascade do |t|
    t.bigint "scale_id", null: false
    t.text "text", null: false
    t.integer "position", null: false
    t.integer "min_value", default: 0, null: false
    t.integer "max_value", default: 4, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["scale_id", "position"], name: "index_questions_on_scale_id_and_position", unique: true
    t.index ["scale_id"], name: "index_questions_on_scale_id"
  end

  create_table "responses", force: :cascade do |t|
    t.integer "survey_id", null: false
    t.string "participant_name"
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
    t.jsonb "scoring_bands", default: [], null: false
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

  add_foreign_key "analyses", "questions", column: "question_a_id"
  add_foreign_key "analyses", "questions", column: "question_b_id"
  add_foreign_key "analyses", "surveys"
  add_foreign_key "analyses", "users"
  add_foreign_key "answers", "questions"
  add_foreign_key "answers", "responses"
  add_foreign_key "questions", "scales"
  add_foreign_key "responses", "surveys"
  add_foreign_key "scales", "users"
  add_foreign_key "surveys", "scales"
  add_foreign_key "surveys", "users"
end
