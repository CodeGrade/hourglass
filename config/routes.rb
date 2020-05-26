Rails.application.routes.draw do
  root to: 'main#index'

  devise_for :users, skip: [:registrations, :passwords], controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }

  resources :courses, param: 'course_id', only: [] do
    member do
      resources :sections, param: 'section_id', only: [] do
        member do
          post :sync
        end
      end
      resources :exams, param: 'exam_id', only: [:new, :create, :edit, :update] do
        member do
          get :take
          get :proctor
          post :finalize
          resources :rooms, param: 'room_id', only: [] do
            member do
              post :finalize
              resources :registrations, param: 'registration_id', only: [:show] do
                member do
                  get :start
                  post :submit
                  post :finalize
                  resources :anomalies, param: 'anomaly_id', only: [:index, :create, :destroy]
                  resources :snapshots, param: 'snapshot_id', only: [:create]
                  resources :questions, param: 'question_id', only: [:create]
                end
              end
            end
          end
        end
      end
    end
  end
end
