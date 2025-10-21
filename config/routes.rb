Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show, :create]
      resources :scales, only: [:index, :create] do
        member do
          patch :publish
        end
      end
      resources :surveys, only: [:index, :create]
      resources :responses, only: [:create] do
        member do
          get :export
        end
      end
      resources :analyses, only: [:create] do
        member do
          get :report
        end
      end
    end
  end
end