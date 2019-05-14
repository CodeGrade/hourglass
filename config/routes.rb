Rails.application.routes.draw do
  resources :courses do
    resources :exams do
      member do
        get :start
        post :save_snapshot
      end
    end
  end
end
