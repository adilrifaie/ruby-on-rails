module Api
  module V1
    class ResponsesController < ApplicationController
      def create
        response = Response.new(response_params)
        if response.save
          render json: { 
            response: response, 
            score: response.calculate_score 
          }, status: :created
        else
          render json: { errors: response.errors }, status: :unprocessable_entity
        end
      end
      
      def export
        response = Response.find(params[:id])
        render json: response.export_data
      end
      
      private
      
      def response_params
        params.require(:response).permit(:survey_id, :participant_name, :answers, :submitted_at)
      end
    end
  end
end