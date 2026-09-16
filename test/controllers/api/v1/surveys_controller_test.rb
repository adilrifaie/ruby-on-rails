require "test_helper"

module Api
  module V1
    class SurveysControllerTest < ActionDispatch::IntegrationTest
      setup do
        @owner = users(:one)
        @other = users(:two)
        @survey = surveys(:one)
        @scale = scales(:one)
      end

      test "index requires authentication" do
        get api_v1_surveys_path, as: :json
        assert_response :unauthorized
      end

      test "index returns surveys" do
        get api_v1_surveys_path, headers: auth_headers(@owner), as: :json
        assert_response :success
      end

      test "show returns a survey" do
        get api_v1_survey_path(@survey), headers: auth_headers(@owner), as: :json
        assert_response :success
      end

      test "create creates a survey for the current user's scale" do
        assert_difference("Survey.count", 1) do
          post api_v1_surveys_path, params: { survey: { scale_id: @scale.id, title: "New Survey" } }, headers: auth_headers(@owner), as: :json
        end
        assert_response :created
      end

      test "create forbids creating a survey for someone else's scale" do
        post api_v1_surveys_path, params: { survey: { scale_id: @scale.id, title: "New Survey" } }, headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "update allows the owner" do
        patch api_v1_survey_path(@survey), params: { survey: { title: "Updated" } }, headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal "Updated", @survey.reload.title
      end

      test "update forbids a non-owner" do
        patch api_v1_survey_path(@survey), params: { survey: { title: "Hacked" } }, headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "destroy allows the owner when the survey has no responses" do
        survey = @owner.surveys.create!(scale: @scale, title: "Deletable")
        assert_difference("Survey.count", -1) do
          delete api_v1_survey_path(survey), headers: auth_headers(@owner), as: :json
        end
        assert_response :no_content
      end

      test "destroy blocks deletion when the survey has responses" do
        delete api_v1_survey_path(@survey), headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
        assert @survey.reload.persisted?
      end

      test "destroy forbids a non-owner" do
        delete api_v1_survey_path(@survey), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end
    end
  end
end
