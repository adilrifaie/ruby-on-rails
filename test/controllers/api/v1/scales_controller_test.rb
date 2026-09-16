require "test_helper"

module Api
  module V1
    class ScalesControllerTest < ActionDispatch::IntegrationTest
      setup do
        @owner = users(:one)
        @other = users(:two)
        @scale = scales(:one)
      end

      test "index requires authentication" do
        get api_v1_scales_path, as: :json
        assert_response :unauthorized
      end

      test "index returns scales for authenticated user" do
        get api_v1_scales_path, headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_kind_of Array, JSON.parse(response.body)
      end

      test "show returns a scale" do
        get api_v1_scale_path(@scale), headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal @scale.id, JSON.parse(response.body)["id"]
      end

      test "create creates a scale owned by current_user" do
        assert_difference("Scale.count", 1) do
          post api_v1_scales_path, params: { scale: { title: "New Scale", description: "desc", version: "1.0" } }, headers: auth_headers(@owner), as: :json
        end
        assert_response :created
        assert_equal @owner.id, Scale.last.user_id
      end

      test "create fails with a validation error" do
        post api_v1_scales_path, params: { scale: { title: "" } }, headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
      end

      test "update allows the owner" do
        patch api_v1_scale_path(@scale), params: { scale: { title: "Updated" } }, headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal "Updated", @scale.reload.title
      end

      test "update forbids a non-owner" do
        patch api_v1_scale_path(@scale), params: { scale: { title: "Hacked" } }, headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "destroy allows the owner when the scale has no surveys" do
        scale = @owner.scales.create!(title: "Deletable", identifier: "SDP-2026-DEL0001")
        assert_difference("Scale.count", -1) do
          delete api_v1_scale_path(scale), headers: auth_headers(@owner), as: :json
        end
        assert_response :no_content
      end

      test "destroy blocks deletion when the scale has surveys" do
        delete api_v1_scale_path(@scale), headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
        assert @scale.reload.persisted?
      end

      test "destroy forbids a non-owner" do
        delete api_v1_scale_path(@scale), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "publish allows the owner" do
        patch publish_api_v1_scale_path(@scale), headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal "published", @scale.reload.status
      end

      test "publish forbids a non-owner" do
        patch publish_api_v1_scale_path(@scale), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end
    end
  end
end
