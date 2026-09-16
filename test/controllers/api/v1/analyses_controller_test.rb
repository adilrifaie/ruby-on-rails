require "test_helper"

module Api
  module V1
    class AnalysesControllerTest < ActionDispatch::IntegrationTest
      setup do
        @owner = users(:one)
        @other = users(:two)
        @survey = surveys(:one)
      end

      test "index requires authentication" do
        get api_v1_analyses_path, as: :json
        assert_response :unauthorized
      end

      test "index returns only the current user's analyses" do
        get api_v1_analyses_path, headers: auth_headers(@owner), as: :json
        assert_response :success
        ids = JSON.parse(response.body).map { |a| a["id"] }
        assert_includes ids, analyses(:one).id
        assert_not_includes ids, analyses(:two).id
      end

      test "show allows the owner" do
        get api_v1_analysis_path(analyses(:one)), headers: auth_headers(@owner), as: :json
        assert_response :success
      end

      test "show forbids a non-owner" do
        get api_v1_analysis_path(analyses(:one)), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "create deducts credits and runs the analysis" do
        assert_difference -> { @owner.reload.credits }, -5 do
          post api_v1_analyses_path, params: { analysis: { survey_id: @survey.id, analysis_type: "descriptive" } }, headers: auth_headers(@owner), as: :json
        end
        assert_response :created
      end

      test "create fails with insufficient credits" do
        @owner.update!(credits: 0)
        post api_v1_analyses_path, params: { analysis: { survey_id: @survey.id, analysis_type: "descriptive" } }, headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
      end

      test "create forbids running an analysis on someone else's survey" do
        post api_v1_analyses_path, params: { analysis: { survey_id: @survey.id, analysis_type: "descriptive" } }, headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "report allows the owner" do
        get report_api_v1_analysis_path(analyses(:one)), headers: auth_headers(@owner), as: :json
        assert_response :success
      end

      test "report forbids a non-owner" do
        get report_api_v1_analysis_path(analyses(:one)), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end
    end
  end
end
