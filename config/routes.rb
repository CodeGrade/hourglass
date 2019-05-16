Rails.application.routes.draw do
  root to: 'main#home'
  devise_for :users, :skip => [:registrations, :passwords]
  resources :courses do
    resources :exams do
      member do
        get :start
        post :save_snapshot
      end
    end
  end
end
