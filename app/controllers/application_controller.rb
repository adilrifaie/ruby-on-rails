class ApplicationController < ActionController::API
  include Pundit::Authorization

  before_action :authenticate_request!

  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  attr_reader :current_user

  private

  def authenticate_request!
    token = request.headers["Authorization"]&.split(" ")&.last
    payload = token && JsonWebToken.decode(token)
    @current_user = payload && User.find_by(id: payload[:user_id])

    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
  end

  def render_forbidden
    render json: { error: "Forbidden" }, status: :forbidden
  end

  def render_not_found
    render json: { error: "Not found" }, status: :not_found
  end
end
