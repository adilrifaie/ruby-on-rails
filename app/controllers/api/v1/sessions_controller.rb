module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authenticate_request!, only: :create

      def create
        @user = User.find_by(email: params[:email])

        if @user&.authenticate(params[:password])
          @token = JsonWebToken.encode(user_id: @user.id)
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end
    end
  end
end
