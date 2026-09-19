require "test_helper"

module Api
  module V1
    class QuestionsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @owner = users(:one)
        @other = users(:two)
        @scale = scales(:one)
      end

      test "create requires authentication" do
        post api_v1_scale_questions_path(@scale), params: { question: { text: "Q1", position: 1, min_value: 0, max_value: 4 } }, as: :json
        assert_response :unauthorized
      end

      test "create allows the scale owner" do
        assert_difference("Question.count", 1) do
          post api_v1_scale_questions_path(@scale), params: { question: { text: "Q1", position: 1, min_value: 0, max_value: 4 } }, headers: auth_headers(@owner), as: :json
        end
        assert_response :created
      end

      test "create forbids a non-owner" do
        post api_v1_scale_questions_path(@scale), params: { question: { text: "Q1", position: 1, min_value: 0, max_value: 4 } }, headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "create fails with a validation error" do
        post api_v1_scale_questions_path(@scale), params: { question: { text: "", position: 1, min_value: 0, max_value: 4 } }, headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
      end

      test "update allows the scale owner" do
        question = @scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
        patch api_v1_scale_question_path(@scale, question), params: { question: { text: "Updated" } }, headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal "Updated", question.reload.text
      end

      test "update forbids a non-owner" do
        question = @scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
        patch api_v1_scale_question_path(@scale, question), params: { question: { text: "Hacked" } }, headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "destroy allows the scale owner when the question has no answers" do
        question = @scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
        assert_difference("Question.count", -1) do
          delete api_v1_scale_question_path(@scale, question), headers: auth_headers(@owner), as: :json
        end
        assert_response :no_content
      end

      test "create is blocked once the scale is published" do
        @scale.update!(status: "published")
        assert_no_difference("Question.count") do
          post api_v1_scale_questions_path(@scale), params: { question: { text: "Q1", position: 1, min_value: 0, max_value: 4 } }, headers: auth_headers(@owner), as: :json
        end
        assert_response :unprocessable_entity
      end

      test "update is blocked once the scale is published" do
        question = @scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
        @scale.update!(status: "published")
        patch api_v1_scale_question_path(@scale, question), params: { question: { text: "Changed" } }, headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
        assert_equal "Q1", question.reload.text
      end

      test "destroy is blocked once the scale is published" do
        question = @scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
        @scale.update!(status: "published")
        assert_no_difference("Question.count") do
          delete api_v1_scale_question_path(@scale, question), headers: auth_headers(@owner), as: :json
        end
        assert_response :unprocessable_entity
      end

      test "destroy blocks deletion when the question has answers" do
        question = @scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
        responses(:one).answers.create!(question: question, value: 2)

        delete api_v1_scale_question_path(@scale, question), headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
        assert question.reload.persisted?
      end
    end
  end
end
