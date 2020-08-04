# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    field_class Types::BaseField
    
    module Guards
      def self.cache(c, type, id, query, who, allowed)
        cur = c
        cur[type] = {} unless cur.key? type
        cur = cur[type]
        cur[id] = {} unless cur.key? id
        cur = cur[id]
        cur[query] = {} unless cur.key? query
        cur = cur[query]
        cur[who] = allowed
      end

      VISIBILITY = ->(obj, _args, ctx) { 
        cached = ctx[:access_cache].dig(obj.class.name, obj.object_id, :visible, ctx[:current_user].id)
        return cached unless cached.nil?

        ans = obj.object.visible_to?(ctx[:current_user]) 
        Guards.cache(ctx[:access_cache], obj.class.name, obj.object_id, :visible, ctx[:current_user].id, ans)
        ans
      }
      PROFESSORS = ->(obj, _args, ctx) {
        cached = ctx[:access_cache].dig(obj.class.name, obj.object_id, :professors, ctx[:current_user].id)
        return cached unless cached.nil?

        ans = obj.object.professors.exists? ctx[:current_user].id
        Guards.cache(ctx[:access_cache], obj.class.name, obj.object_id, :professors, ctx[:current_user].id, ans)
        ans
      }
      PROCTORS_AND_PROFESSORS = ->(obj, _args, ctx) {
        cached = (ctx[:access_cache].dig(obj.class.name, obj.object_id, :proctors_and_professors, ctx[:current_user].id) ||
                  ctx[:access_cache].dig(obj.class.name, obj.object_id, :professors, ctx[:current_user].id))
        return cached unless cached.nil?

        ans = obj.object.proctors_and_professors.exists? ctx[:current_user].id
        Guards.cache(ctx[:access_cache], obj.class.name, obj.object_id, :proctors_and_professors, ctx[:current_user].id, ans)
        ans
      }
      CURRENT_USER_ADMIN = ->(_obj, _args, ctx) { ctx[:current_user].admin? }
    end
  end
end
