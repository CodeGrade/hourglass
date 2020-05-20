Rails.application.routes.draw do
  root to: 'main#index'

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  namespace :professor do
    resources :exams, only: [:show, :new, :create, :edit, :update]
  end

  namespace :proctor do
    resources :exams, only: [:show] do
      post :finalize

      resources :anomalies, only: [:show, :index, :destroy]

      resources :registrations, only: [] do
        post :clear_anomalies
        post :finalize
      end

      resources :rooms, only: [:show, :index] do
        post :finalize
      end
    end
  end

  namespace :student do
    resources :exams, only: [:show] do
      get :start
      post :submit

      resources :anomalies, only: [:create]
      post :save_snapshot

      post :ask_question
    end
  end
end
