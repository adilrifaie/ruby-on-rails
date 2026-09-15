module Api
  module V1
    class ScalesController < ApplicationController
      def index
        @scales = Scale.includes(:user).all
      end

      def create
        @scale = current_user.scales.new(scale_params)
        if @scale.save
          render :show, status: :created
        else
          render json: { errors: @scale.errors }, status: :unprocessable_entity
        end
      end

      def publish
        @scale = Scale.find(params[:id])
        authorize @scale
        @scale.publish
        render :show
      end

      private

      def scale_params
        params.require(:scale).permit(:title, :description, :version)
      end
    end
  end
end
