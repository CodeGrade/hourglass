# frozen_string_literal: true

module Types
  # The base class of Hourglass objects returned by GraphQL
  class BaseObject < GraphQL::Schema::Object
    field_class Types::BaseField

    module Guards
      def self.cache(cache, path, allowed)
        type, id, query, who = path
        cur = cache
        cur[type] = {} unless cur.key? type
        cur = cur[type]
        cur[id] = {} unless cur.key? id
        cur = cur[id]
        cur[query] = {} unless cur.key? query
        cur = cur[query]
        cur[who] = allowed
      end

      VISIBILITY = lambda { |obj, _args, ctx|
        cached = ctx[:access_cache]
                 .dig(obj.class.name, obj.object_id, :visible, ctx[:current_user].id)
        return cached unless cached.nil?

        ans = obj.object.visible_to?(ctx[:current_user])
        Guards.cache(
          ctx[:access_cache],
          [obj.class.name, obj.object_id, :visible, ctx[:current_user].id],
          ans,
        )
        ans
      }
      PROFESSORS = lambda { |obj, _args, ctx|
        cached = ctx[:access_cache]
                 .dig(obj.class.name, obj.object_id, :professors, ctx[:current_user].id)
        return cached unless cached.nil?

        ans = obj.object.professors.exists? ctx[:current_user].id
        Guards.cache(
          ctx[:access_cache],
          [obj.class.name, obj.object_id, :professors, ctx[:current_user].id],
          ans,
        )
        ans
      }
      PROCTORS_AND_PROFESSORS = lambda { |obj, _args, ctx|
        cached = (
          ctx[:access_cache].dig(
            obj.class.name,
            obj.object_id,
            :proctors_and_professors,
            ctx[:current_user].id,
          ) ||
          ctx[:access_cache].dig(
            obj.class.name,
            obj.object_id,
            :professors,
            ctx[:current_user].id,
          )
        )
        return cached unless cached.nil?

        ans = obj.object.proctors_and_professors.exists? ctx[:current_user].id
        Guards.cache(
          ctx[:access_cache],
          [obj.class.name, obj.object_id, :proctors_and_professors, ctx[:current_user].id],
          ans,
        )
        ans
      }
      ALL_STAFF = lambda { |obj, _args, ctx|
        cached = (
          ctx[:access_cache].dig(
            obj.class.name,
            obj.object_id,
            :all_staff,
            ctx[:current_user].id,
          ) ||
          ctx[:access_cache].dig(
            obj.class.name,
            obj.object_id,
            :professors,
            ctx[:current_user].id,
          )
        )
        return cached unless cached.nil?

        ans = obj.object.course.all_staff.exists? ctx[:current_user].id
        Guards.cache(
          ctx[:access_cache],
          [obj.class.name, obj.object_id, :all_staff, ctx[:current_user].id],
          ans,
        )
        ans
      }
      CURRENT_USER_ADMIN = lambda { |_obj, _args, ctx|
        ctx[:current_user].admin?
      }
    end
  end
end
