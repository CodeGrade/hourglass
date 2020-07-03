# frozen_string_literal: true

Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  post "/graphql", to: "graphql#execute"
  if Rails.env.development?
    get "/graphiql", to: "graphql#graphiql"
  end
  namespace :api do
    namespace :professor do
      resources :courses, shallow: true, param: 'course_id', only: [] do
        member do
          post :sync
          resources :exams, param: 'exam_id', only: [:create, :show] do
            member do
              resources :registrations, param: 'registration_id', only: [:index]
              resources :accommodations, param: 'accommodation_id', only: [:index, :update, :destroy, :create]
              resources :versions, param: 'version_id', only: [:index, :show, :create, :update, :destroy] do
                collection do
                  post :import
                  post :update_all
                end
                member do
                  get :export_file
                  get :export_archive
                end
              end
              resources :rooms, param: 'room_id', only: [:index] do
                collection do
                  post :update_all_rooms
                  get :staff_regs
                  post :update_all_staff
                  post :update_all
                end
              end
            end
          end
        end
      end
    end

    namespace :proctor do
      resources :exams, shallow: true, param: 'exam_id', only: [] do
        member do
          post :finalize
          resources :anomalies, param: 'anomaly_id', only: [:index, :destroy]
          resources :messages, param: 'message_id', only: [:index, :create]
        end
      end
    end

    namespace :student do
      resources :exams, param: 'exam_id', only: [] do
        member do
          post :take
          post :question
          get :questions
          post :messages
        end
      end
    end
  end

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks',
  }

  root to: 'main#index'
  get '*path', to: 'main#index'
end
