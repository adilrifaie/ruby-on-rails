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

      test "index returns only the current user's scales" do
        get api_v1_scales_path, headers: auth_headers(@owner), as: :json
        ids = JSON.parse(response.body).map { |scale| scale["id"] }
        assert_includes ids, @scale.id
        assert_not_includes ids, scales(:two).id
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
        @scale.questions.create!(text: "Q1", position: 1, min_value: 0, max_value: 4)
        patch publish_api_v1_scale_path(@scale), headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal "published", @scale.reload.status
      end

      test "publish rejects a scale with no questions" do
        patch publish_api_v1_scale_path(@scale), headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
        assert_not_equal "published", @scale.reload.status
      end

      test "publish forbids a non-owner" do
        patch publish_api_v1_scale_path(@scale), headers: auth_headers(@other), as: :json
        assert_response :forbidden
      end

      test "update saves valid scoring bands and returns them" do
        bands = [ { label: "Low", min: 0, max: 4 }, { label: "High", min: 5, max: 10 } ]
        patch api_v1_scale_path(@scale), params: { scale: { scoring_bands: bands } }, headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal %w[Low High], JSON.parse(response.body)["scoring_bands"].map { |band| band["label"] }
        assert_equal 5, @scale.reload.scoring_bands.last["min"]
      end

      test "update clears scoring bands with an empty list" do
        @scale.update!(scoring_bands: [ { "label" => "Low", "min" => 0, "max" => 4 } ])
        patch api_v1_scale_path(@scale), params: { scale: { scoring_bands: [] } }, headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal [], @scale.reload.scoring_bands
      end

      test "update rejects overlapping scoring bands" do
        bands = [ { label: "Low", min: 0, max: 5 }, { label: "High", min: 5, max: 10 } ]
        patch api_v1_scale_path(@scale), params: { scale: { scoring_bands: bands } }, headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
      end

      test "update rejects a scoring band whose min is above its max" do
        patch api_v1_scale_path(@scale), params: { scale: { scoring_bands: [ { label: "Low", min: 6, max: 2 } ] } }, headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
      end

      test "update rejects scoring band changes once published" do
        @scale.update!(status: "published")
        patch api_v1_scale_path(@scale), params: { scale: { scoring_bands: [ { label: "Low", min: 0, max: 4 } ] } }, headers: auth_headers(@owner), as: :json
        assert_response :unprocessable_entity
      end

      test "update still allows the title to change once published" do
        @scale.update!(status: "published")
        patch api_v1_scale_path(@scale), params: { scale: { title: "Renamed" } }, headers: auth_headers(@owner), as: :json
        assert_response :success
        assert_equal "Renamed", @scale.reload.title
      end
    end
  end
end
