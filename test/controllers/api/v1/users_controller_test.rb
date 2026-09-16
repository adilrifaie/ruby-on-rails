require "test_helper"

module Api
  module V1
    class UsersControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = users(:one)
        @other = users(:two)
      end

      test "index requires authentication" do
        get api_v1_users_path, as: :json
        assert_response :unauthorized
      end

      test "index returns users when authenticated" do
        get api_v1_users_path, headers: auth_headers(@user), as: :json
        assert_response :success
      end

      test "create registers a new user with locked-down role and credits" do
        assert_difference("User.count", 1) do
          post api_v1_users_path, params: { user: { email: "new@example.com", password: "password", role: "admin", credits: 9999 } }, as: :json
        end
        assert_response :created
        user = User.last
        assert_equal "student", user.role
        assert_equal Api::V1::UsersController::DEFAULT_STARTING_CREDITS, user.credits
      end

      test "update allows a user to update their own profile" do
        patch api_v1_user_path(@user), params: { user: { email: "updated@example.com" } }, headers: auth_headers(@user), as: :json
        assert_response :success
        assert_equal "updated@example.com", @user.reload.email
      end

      test "update forbids updating someone else's profile" do
        patch api_v1_user_path(@other), params: { user: { email: "hacked@example.com" } }, headers: auth_headers(@user), as: :json
        assert_response :forbidden
      end

      test "update ignores role and credits changes" do
        patch api_v1_user_path(@user), params: { user: { role: "admin", credits: 9999 } }, headers: auth_headers(@user), as: :json
        assert_response :success
        @user.reload
        assert_equal "researcher", @user.role
        assert_equal 100, @user.credits
      end
    end
  end
end
