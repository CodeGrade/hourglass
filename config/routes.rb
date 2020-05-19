Rails.application.routes.draw do
  root to: 'main#home'

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  resources :exams, only: [:show, :index, :new, :create] do
    member do
      get :start
      post :finalize
      post :submit

      post :save_snapshot
      post :ask_question
    end

    resources :registrations, only: [:show, :index] do
      resources :anomalies, only: [:show, :index, :destroy, :create]

      post :clear_anomalies
      post :finalize
    end

    resources :rooms, only: [:show, :index] do
      post :finalize
    end
  end
end
