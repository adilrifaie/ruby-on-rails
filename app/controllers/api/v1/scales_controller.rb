module Api
  module V1
    class ScalesController < ApplicationController
      def index
        scales = Scale.includes(:user).all
        render json: scales, include: :user
      end
      
      def create
        scale = Scale.new(scale_params)
        if scale.save
          render json: scale, status: :created
        else
          render json: { errors: scale.errors }, status: :unprocessable_entity
        end
      end
      
      def publish
        scale = Scale.find(params[:id])
        scale.publish
        render json: scale
      end
      
      private
      
      def scale_params
        params.require(:scale).permit(:user_id, :title, :description, :version, :status)
      end
    end
  end
end