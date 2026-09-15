module Api
  module V1
    class AnalysesController < ApplicationController
      def create
        analysis = Analysis.new(analysis_params)
        analysis.user = current_user
        authorize analysis

        if analysis.save
          analysis.execute_analysis
          render json: analysis, status: :created
        else
          render json: { errors: analysis.errors }, status: :unprocessable_entity
        end
      end

      def report
        analysis = Analysis.find(params[:id])
        authorize analysis
        render json: analysis.generate_report
      end

      private

      def analysis_params
        params.require(:analysis).permit(:survey_id, :analysis_type, :question_a_id, :question_b_id)
      end
    end
  end
end
