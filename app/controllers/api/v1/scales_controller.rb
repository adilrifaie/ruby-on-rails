module Api
  module V1
    class ScalesController < ApplicationController
      def index
        page = [ (params[:page] || 1).to_i, 1 ].max
        per = [ (params[:per] || 25).to_i, 1 ].max
        @scales = current_user.scales.includes(:user).order(:id).offset((page - 1) * per).limit(per)
      end

      def show
        @scale = Scale.find(params[:id])
      end

      def create
        @scale = current_user.scales.new(scale_params)
        if @scale.save
          render :show, status: :created
        else
          render json: { errors: @scale.errors }, status: :unprocessable_entity
        end
      end

      def update
        @scale = Scale.find(params[:id])
        authorize @scale
        if @scale.update(scale_params)
          render :show
        else
          render json: { errors: @scale.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        @scale = Scale.find(params[:id])
        authorize @scale
        if @scale.surveys.exists?
          render json: { error: "cannot delete a scale that already has surveys" }, status: :unprocessable_entity
        else
          @scale.destroy
          head :no_content
        end
      end

      def publish
        @scale = Scale.find(params[:id])
        authorize @scale
        unless @scale.questions.exists?
          return render json: { error: "Add at least one question before publishing" }, status: :unprocessable_entity
        end
        @scale.publish
        render :show
      end

      private

      def scale_params
        permitted = params.require(:scale).permit(:title, :description, :version, scoring_bands: [ :label, :min, :max ])
        # An empty array is dropped by permit; keep it so a client can clear every band.
        permitted[:scoring_bands] = [] if params[:scale].key?(:scoring_bands) && params[:scale][:scoring_bands].blank?
        permitted.to_h
      end
    end
  end
end
