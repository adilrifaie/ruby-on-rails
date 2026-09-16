require "test_helper"

module Api
  module V1
    class ResponsesControllerTest < ActionDispatch::IntegrationTest
      setup do
        @owner = users(:one)
        @other = users(:two)
        @survey = surveys(:one)
        @question = @survey.scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
      end

      test "create does not require authentication" do
        assert_difference("Response.count", 1) do
          post api_v1_responses_path, params: {
            response: {
              survey_id: @survey.id,
              participant_name: "Anon",
              answers_attributes: [ { question_id: @question.id, value: 3 } ]
            }
          }, as: :json
        end
        assert_response :created
      end

      test "create fails validation with more than one answer for the same question" do
        post api_v1_responses_path, params: {
          response: {
            survey_id: @survey.id,
            participant_name: "Anon",
            answers_attributes: [
              { question_id: @question.id, value: 3 },
              { question_id: @question.id, value: 1 }
            ]
          }
        }, as: :json
        assert_response :unprocessable_entity
      end

      test "show requires authentication" do
        get api_v1_response_path(responses(:one)), as: :json
        assert_response :unauthorized
      end

      test "show allows the survey owner" do
        get api_v1_response_path(responses(:one)), headers: auth_headers(@owner), as: :json
        assert_response :success
      end

      test "show forbids a non-owner" do
        get api_v1_response_path(responses(:one)), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "export allows the survey owner" do
        get export_api_v1_response_path(responses(:one)), headers: auth_headers(@owner), as: :json
        assert_response :success
      end

      test "export forbids a non-owner" do
        get export_api_v1_response_path(responses(:one)), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end
    end
  end
end
