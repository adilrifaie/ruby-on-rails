module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authenticate_request!, only: :create

      DEFAULT_STARTING_CREDITS = 20

      def index
        @users = User.all
      end

      def show
        @user = User.find(params[:id])
      end

      def create
        @user = User.new(user_params.merge(role: "student", credits: DEFAULT_STARTING_CREDITS))
        if @user.save
          render :show, status: :created
        else
          render json: { errors: @user.errors }, status: :unprocessable_entity
        end
      end

      def update
        @user = User.find(params[:id])
        authorize @user
        if @user.update(user_params)
          render :show
        else
          render json: { errors: @user.errors }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password)
      end
    end
  end
end
