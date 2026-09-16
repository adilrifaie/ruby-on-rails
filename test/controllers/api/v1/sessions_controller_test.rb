require "test_helper"

module Api
  module V1
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      test "create returns a token for valid credentials" do
        post api_v1_session_path, params: { email: users(:one).email, password: "password" }, as: :json
        assert_response :success
        assert JSON.parse(response.body)["token"].present?
      end

      test "create rejects invalid credentials" do
        post api_v1_session_path, params: { email: users(:one).email, password: "wrong" }, as: :json
        assert_response :unauthorized
      end
    end
  end
end
