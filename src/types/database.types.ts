// Generated from the Supabase schema via the Supabase MCP (generate_typescript_types).
// Do not edit by hand. Regenerate after every migration.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      accommodation_translations: {
        Row: {
          accommodation_id: string;
          canonical_override: string | null;
          created_at: string;
          description: Json | null;
          direct_answers: Json;
          faqs: Json;
          focus_keyword: string | null;
          id: string;
          keywords: Json;
          locale: string;
          name: string;
          og_image_id: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          accommodation_id: string;
          canonical_override?: string | null;
          created_at?: string;
          description?: Json | null;
          direct_answers?: Json;
          faqs?: Json;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale: string;
          name: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          accommodation_id?: string;
          canonical_override?: string | null;
          created_at?: string;
          description?: Json | null;
          direct_answers?: Json;
          faqs?: Json;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale?: string;
          name?: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'accommodation_translations_accommodation_id_fkey';
            columns: ['accommodation_id'];
            isOneToOne: false;
            referencedRelation: 'accommodations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accommodation_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          }
        ];
      };
      accommodations: {
        Row: {
          amenities: Json;
          availability: string | null;
          comfort_level: string | null;
          country: string | null;
          created_at: string;
          deleted_at: string | null;
          destination_id: string | null;
          gallery: Json;
          id: string;
          map_query: string | null;
          price_per_night: number | null;
          property_type: string | null;
          region: string | null;
          room_types: Json;
          status: string;
          updated_at: string;
        };
        Insert: {
          amenities?: Json;
          availability?: string | null;
          comfort_level?: string | null;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          destination_id?: string | null;
          gallery?: Json;
          id?: string;
          map_query?: string | null;
          price_per_night?: number | null;
          property_type?: string | null;
          region?: string | null;
          room_types?: Json;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amenities?: Json;
          availability?: string | null;
          comfort_level?: string | null;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          destination_id?: string | null;
          gallery?: Json;
          id?: string;
          map_query?: string | null;
          price_per_night?: number | null;
          property_type?: string | null;
          region?: string | null;
          room_types?: Json;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'accommodations_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          }
        ];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          created_at: string;
          deleted_at: string | null;
          featured: boolean;
          id: string;
          primary_category_id: string | null;
          published_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          featured?: boolean;
          id?: string;
          primary_category_id?: string | null;
          published_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          featured?: boolean;
          id?: string;
          primary_category_id?: string | null;
          published_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_posts_primary_category_id_fkey';
            columns: ['primary_category_id'];
            isOneToOne: false;
            referencedRelation: 'blog_categories';
            referencedColumns: ['id'];
          }
        ];
      };
      blog_categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      blog_tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      blog_post_categories: {
        Row: {
          category_id: string;
          post_id: string;
        };
        Insert: {
          category_id: string;
          post_id: string;
        };
        Update: {
          category_id?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_post_categories_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'blog_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_post_categories_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'blog_posts';
            referencedColumns: ['id'];
          }
        ];
      };
      blog_post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_post_tags_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'blog_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_post_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'blog_tags';
            referencedColumns: ['id'];
          }
        ];
      };
      blog_translations: {
        Row: {
          canonical_override: string | null;
          content: Json | null;
          created_at: string;
          direct_answers: Json;
          excerpt: string | null;
          faqs: Json;
          featured_image_caption: string | null;
          focus_keyword: string | null;
          id: string;
          keywords: Json;
          locale: string;
          og_image_id: string | null;
          post_id: string;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          canonical_override?: string | null;
          content?: Json | null;
          created_at?: string;
          direct_answers?: Json;
          excerpt?: string | null;
          faqs?: Json;
          featured_image_caption?: string | null;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale: string;
          og_image_id?: string | null;
          post_id: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          canonical_override?: string | null;
          content?: Json | null;
          created_at?: string;
          direct_answers?: Json;
          excerpt?: string | null;
          faqs?: Json;
          featured_image_caption?: string | null;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale?: string;
          og_image_id?: string | null;
          post_id?: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blog_translations_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'blog_posts';
            referencedColumns: ['id'];
          }
        ];
      };
      destination_translations: {
        Row: {
          canonical_override: string | null;
          created_at: string;
          description: Json | null;
          destination_id: string;
          direct_answers: Json;
          faqs: Json;
          focus_keyword: string | null;
          id: string;
          keywords: Json;
          locale: string;
          name: string;
          og_image_id: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          canonical_override?: string | null;
          created_at?: string;
          description?: Json | null;
          destination_id: string;
          direct_answers?: Json;
          faqs?: Json;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale: string;
          name: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          canonical_override?: string | null;
          created_at?: string;
          description?: Json | null;
          destination_id?: string;
          direct_answers?: Json;
          faqs?: Json;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale?: string;
          name?: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'destination_translations_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'destination_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          }
        ];
      };
      destinations: {
        Row: {
          best_time: Json;
          country: string | null;
          created_at: string;
          deleted_at: string | null;
          gallery: Json;
          id: string;
          latitude: number | null;
          longitude: number | null;
          region: string | null;
          status: string;
          updated_at: string;
          wildlife: Json;
        };
        Insert: {
          best_time?: Json;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          gallery?: Json;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          region?: string | null;
          status?: string;
          updated_at?: string;
          wildlife?: Json;
        };
        Update: {
          best_time?: Json;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          gallery?: Json;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          region?: string | null;
          status?: string;
          updated_at?: string;
          wildlife?: Json;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          assigned_to: string | null;
          booking_reference: string | null;
          budget: string | null;
          country: string | null;
          created_at: string;
          deleted_at: string | null;
          destinations: string | null;
          email: string;
          enquiry_type: string;
          form_data: Json;
          id: string;
          locale: string;
          message: string;
          name: string;
          notes: Json;
          phone: string | null;
          preferred_dates: string | null;
          reference_code: string | null;
          source_path: string | null;
          status: string;
          topic: string | null;
          travelers: number | null;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          booking_reference?: string | null;
          budget?: string | null;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          destinations?: string | null;
          email: string;
          enquiry_type?: string;
          form_data?: Json;
          id?: string;
          locale?: string;
          message: string;
          name: string;
          notes?: Json;
          phone?: string | null;
          preferred_dates?: string | null;
          reference_code?: string | null;
          source_path?: string | null;
          status?: string;
          topic?: string | null;
          travelers?: number | null;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          booking_reference?: string | null;
          budget?: string | null;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          destinations?: string | null;
          email?: string;
          enquiry_type?: string;
          form_data?: Json;
          id?: string;
          locale?: string;
          message?: string;
          name?: string;
          notes?: Json;
          phone?: string | null;
          preferred_dates?: string | null;
          reference_code?: string | null;
          source_path?: string | null;
          status?: string;
          topic?: string | null;
          travelers?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      experience_translations: {
        Row: {
          canonical_override: string | null;
          content: Json | null;
          created_at: string;
          direct_answers: Json;
          experience_id: string;
          faqs: Json;
          focus_keyword: string | null;
          id: string;
          keywords: Json;
          locale: string;
          og_image_id: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          canonical_override?: string | null;
          content?: Json | null;
          created_at?: string;
          direct_answers?: Json;
          experience_id: string;
          faqs?: Json;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          canonical_override?: string | null;
          content?: Json | null;
          created_at?: string;
          direct_answers?: Json;
          experience_id?: string;
          faqs?: Json;
          focus_keyword?: string | null;
          id?: string;
          keywords?: Json;
          locale?: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'experience_translations_experience_id_fkey';
            columns: ['experience_id'];
            isOneToOne: false;
            referencedRelation: 'experiences';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'experience_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          }
        ];
      };
      experiences: {
        Row: {
          category: string | null;
          countries: string[];
          created_at: string;
          deleted_at: string | null;
          gallery: Json;
          highlights: Json;
          id: string;
          layout_variant: string;
          menu_group: string;
          menu_position: number;
          package_pricing: Json;
          status: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          countries?: string[];
          created_at?: string;
          deleted_at?: string | null;
          gallery?: Json;
          highlights?: Json;
          id?: string;
          layout_variant?: string;
          menu_group?: string;
          menu_position?: number;
          package_pricing?: Json;
          status?: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          countries?: string[];
          created_at?: string;
          deleted_at?: string | null;
          gallery?: Json;
          highlights?: Json;
          id?: string;
          layout_variant?: string;
          menu_group?: string;
          menu_position?: number;
          package_pricing?: Json;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fleet_vehicle_translations: {
        Row: {
          canonical_override: string | null;
          description: Json | null;
          direct_answers: Json;
          faqs: Json;
          id: string;
          locale: string;
          og_image_id: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          summary: string | null;
          title: string;
          vehicle_id: string;
        };
        Insert: {
          canonical_override?: string | null;
          description?: Json | null;
          direct_answers?: Json;
          faqs?: Json;
          id?: string;
          locale: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          summary?: string | null;
          title: string;
          vehicle_id: string;
        };
        Update: {
          canonical_override?: string | null;
          description?: Json | null;
          direct_answers?: Json;
          faqs?: Json;
          id?: string;
          locale?: string;
          og_image_id?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          summary?: string | null;
          title?: string;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fleet_vehicle_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fleet_vehicle_translations_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'fleet_vehicles';
            referencedColumns: ['id'];
          }
        ];
      };
      fleet_vehicles: {
        Row: {
          capacity: number | null;
          created_at: string;
          features: Json;
          gallery: Json;
          id: string;
          status: string;
          vehicle_type: string | null;
        };
        Insert: {
          capacity?: number | null;
          created_at?: string;
          features?: Json;
          gallery?: Json;
          id?: string;
          status?: string;
          vehicle_type?: string | null;
        };
        Update: {
          capacity?: number | null;
          created_at?: string;
          features?: Json;
          gallery?: Json;
          id?: string;
          status?: string;
          vehicle_type?: string | null;
        };
        Relationships: [];
      };
      fleet_gallery_items: {
        Row: {
          created_at: string;
          id: string;
          media_id: string;
          position: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          media_id: string;
          position?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          media_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fleet_gallery_items_media_id_fkey';
            columns: ['media_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          }
        ];
      };
      media_assets: {
        Row: {
          alt: string | null;
          bucket: string;
          caption: string | null;
          created_at: string;
          created_by: string | null;
          dominant_color: string | null;
          focal_point: Json | null;
          id: string;
          path: string;
          title: string | null;
          url: string | null;
        };
        Insert: {
          alt?: string | null;
          bucket?: string;
          caption?: string | null;
          created_at?: string;
          created_by?: string | null;
          dominant_color?: string | null;
          focal_point?: Json | null;
          id?: string;
          path: string;
          title?: string | null;
          url?: string | null;
        };
        Update: {
          alt?: string | null;
          bucket?: string;
          caption?: string | null;
          created_at?: string;
          created_by?: string | null;
          dominant_color?: string | null;
          focal_point?: Json | null;
          id?: string;
          path?: string;
          title?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      national_park_translations: {
        Row: {
          canonical_override: string | null;
          created_at: string;
          description: Json | null;
          direct_answers: Json;
          faqs: Json;
          id: string;
          locale: string;
          name: string;
          og_image_id: string | null;
          park_id: string;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          canonical_override?: string | null;
          created_at?: string;
          description?: Json | null;
          direct_answers?: Json;
          faqs?: Json;
          id?: string;
          locale: string;
          name: string;
          og_image_id?: string | null;
          park_id: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          canonical_override?: string | null;
          created_at?: string;
          description?: Json | null;
          direct_answers?: Json;
          faqs?: Json;
          id?: string;
          locale?: string;
          name?: string;
          og_image_id?: string | null;
          park_id?: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'national_park_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'national_park_translations_park_id_fkey';
            columns: ['park_id'];
            isOneToOne: false;
            referencedRelation: 'national_parks';
            referencedColumns: ['id'];
          }
        ];
      };
      national_parks: {
        Row: {
          activities: Json;
          best_time: Json;
          country: string | null;
          created_at: string;
          destination_id: string | null;
          established_year: number | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          park_size_km2: number | null;
          position: number;
          region: string | null;
          status: string;
          updated_at: string;
          wildlife: Json;
        };
        Insert: {
          activities?: Json;
          best_time?: Json;
          country?: string | null;
          created_at?: string;
          destination_id?: string | null;
          established_year?: number | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          park_size_km2?: number | null;
          position?: number;
          region?: string | null;
          status?: string;
          updated_at?: string;
          wildlife?: Json;
        };
        Update: {
          activities?: Json;
          best_time?: Json;
          country?: string | null;
          created_at?: string;
          destination_id?: string | null;
          established_year?: number | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          park_size_km2?: number | null;
          position?: number;
          region?: string | null;
          status?: string;
          updated_at?: string;
          wildlife?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'national_parks_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          }
        ];
      };
      package_translations: {
        Row: {
          canonical_override: string | null;
          content: Json | null;
          direct_answers: Json;
          excerpt: string | null;
          faqs: Json;
          id: string;
          locale: string;
          og_image_id: string | null;
          package_id: string;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          title: string;
        };
        Insert: {
          canonical_override?: string | null;
          content?: Json | null;
          direct_answers?: Json;
          excerpt?: string | null;
          faqs?: Json;
          id?: string;
          locale: string;
          og_image_id?: string | null;
          package_id: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          title: string;
        };
        Update: {
          canonical_override?: string | null;
          content?: Json | null;
          direct_answers?: Json;
          excerpt?: string | null;
          faqs?: Json;
          id?: string;
          locale?: string;
          og_image_id?: string | null;
          package_id?: string;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'package_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'package_translations_package_id_fkey';
            columns: ['package_id'];
            isOneToOne: false;
            referencedRelation: 'packages';
            referencedColumns: ['id'];
          }
        ];
      };
      packages: {
        Row: {
          comfort_tier: string | null;
          created_at: string;
          id: string;
          package_group: string | null;
          status: string;
          tour_id: string | null;
          updated_at: string;
        };
        Insert: {
          comfort_tier?: string | null;
          created_at?: string;
          id?: string;
          package_group?: string | null;
          status?: string;
          tour_id?: string | null;
          updated_at?: string;
        };
        Update: {
          comfort_tier?: string | null;
          created_at?: string;
          id?: string;
          package_group?: string | null;
          status?: string;
          tour_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'packages_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          role: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      redirects: {
        Row: {
          created_at: string;
          destination_path: string;
          id: string;
          notes: string | null;
          source_path: string;
          status_code: number;
        };
        Insert: {
          created_at?: string;
          destination_path: string;
          id?: string;
          notes?: string | null;
          source_path: string;
          status_code?: number;
        };
        Update: {
          created_at?: string;
          destination_path?: string;
          id?: string;
          notes?: string | null;
          source_path?: string;
          status_code?: number;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          author_location: string | null;
          author_name: string;
          avatar_url: string | null;
          body: string;
          created_at: string;
          featured: boolean;
          id: string;
          position: number;
          rating: number;
          review_date: string | null;
          source: string | null;
          source_url: string | null;
          status: string;
          title: string | null;
          tour_id: string | null;
          updated_at: string;
        };
        Insert: {
          author_location?: string | null;
          author_name: string;
          avatar_url?: string | null;
          body: string;
          created_at?: string;
          featured?: boolean;
          id?: string;
          position?: number;
          rating?: number;
          review_date?: string | null;
          source?: string | null;
          source_url?: string | null;
          status?: string;
          title?: string | null;
          tour_id?: string | null;
          updated_at?: string;
        };
        Update: {
          author_location?: string | null;
          author_name?: string;
          avatar_url?: string | null;
          body?: string;
          created_at?: string;
          featured?: boolean;
          id?: string;
          position?: number;
          rating?: number;
          review_date?: string | null;
          source?: string | null;
          source_url?: string | null;
          status?: string;
          title?: string | null;
          tour_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      site_settings: {
        Row: {
          address_short: string | null;
          analytics: Json;
          company_name: string;
          email: string;
          enquiry_email_enabled: boolean;
          enquiry_whatsapp_enabled: boolean;
          favicon_url: string | null;
          id: string;
          kato_address: string | null;
          logo_url: string | null;
          notify_emails: string[];
          og_default_image_url: string | null;
          page_heroes: Json;
          phone_office: string | null;
          phone_primary: string;
          phone_secondary: string | null;
          postal_address: string | null;
          seo_defaults: Json;
          singleton_key: string;
          social_links: Json;
          tagline: string | null;
          theme_color: string | null;
          updated_at: string;
          whatsapp_message: string | null;
          whatsapp_notify_phone: string | null;
        };
        Insert: {
          address_short?: string | null;
          analytics?: Json;
          company_name?: string;
          email?: string;
          enquiry_email_enabled?: boolean;
          enquiry_whatsapp_enabled?: boolean;
          favicon_url?: string | null;
          id?: string;
          kato_address?: string | null;
          logo_url?: string | null;
          notify_emails?: string[];
          og_default_image_url?: string | null;
          page_heroes?: Json;
          phone_office?: string | null;
          phone_primary?: string;
          phone_secondary?: string | null;
          postal_address?: string | null;
          seo_defaults?: Json;
          singleton_key?: string;
          social_links?: Json;
          tagline?: string | null;
          theme_color?: string | null;
          updated_at?: string;
          whatsapp_message?: string | null;
          whatsapp_notify_phone?: string | null;
        };
        Update: {
          address_short?: string | null;
          analytics?: Json;
          company_name?: string;
          email?: string;
          enquiry_email_enabled?: boolean;
          enquiry_whatsapp_enabled?: boolean;
          favicon_url?: string | null;
          id?: string;
          kato_address?: string | null;
          logo_url?: string | null;
          notify_emails?: string[];
          og_default_image_url?: string | null;
          page_heroes?: Json;
          phone_office?: string | null;
          phone_primary?: string;
          phone_secondary?: string | null;
          postal_address?: string | null;
          seo_defaults?: Json;
          singleton_key?: string;
          social_links?: Json;
          tagline?: string | null;
          theme_color?: string | null;
          updated_at?: string;
          whatsapp_message?: string | null;
          whatsapp_notify_phone?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          bio: string;
          created_at: string;
          email: string | null;
          id: string;
          job_title: string;
          media_id: string | null;
          name: string;
          phone: string | null;
          position: number;
          role_type: string;
          status: string;
          updated_at: string;
          years_experience: number | null;
        };
        Insert: {
          bio?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          job_title?: string;
          media_id?: string | null;
          name: string;
          phone?: string | null;
          position?: number;
          role_type: string;
          status?: string;
          updated_at?: string;
          years_experience?: number | null;
        };
        Update: {
          bio?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          job_title?: string;
          media_id?: string | null;
          name?: string;
          phone?: string | null;
          position?: number;
          role_type?: string;
          status?: string;
          updated_at?: string;
          years_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_media_id_fkey';
            columns: ['media_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_accommodations: {
        Row: {
          accommodation_id: string;
          day_number: number | null;
          position: number;
          tour_id: string;
        };
        Insert: {
          accommodation_id: string;
          day_number?: number | null;
          position?: number;
          tour_id: string;
        };
        Update: {
          accommodation_id?: string;
          day_number?: number | null;
          position?: number;
          tour_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_accommodations_accommodation_id_fkey';
            columns: ['accommodation_id'];
            isOneToOne: false;
            referencedRelation: 'accommodations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tour_accommodations_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_destinations: {
        Row: {
          destination_id: string;
          position: number;
          tour_id: string;
        };
        Insert: {
          destination_id: string;
          position?: number;
          tour_id: string;
        };
        Update: {
          destination_id?: string;
          position?: number;
          tour_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_destinations_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tour_destinations_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_experiences: {
        Row: {
          experience_id: string;
          position: number;
          tour_id: string;
        };
        Insert: {
          experience_id: string;
          position?: number;
          tour_id: string;
        };
        Update: {
          experience_id?: string;
          position?: number;
          tour_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_experiences_experience_id_fkey';
            columns: ['experience_id'];
            isOneToOne: false;
            referencedRelation: 'experiences';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tour_experiences_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_fleet: {
        Row: {
          position: number;
          tour_id: string;
          vehicle_id: string;
        };
        Insert: {
          position?: number;
          tour_id: string;
          vehicle_id: string;
        };
        Update: {
          position?: number;
          tour_id?: string;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_fleet_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tour_fleet_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'fleet_vehicles';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_national_parks: {
        Row: {
          park_id: string;
          position: number;
          tour_id: string;
        };
        Insert: {
          park_id: string;
          position?: number;
          tour_id: string;
        };
        Update: {
          park_id?: string;
          position?: number;
          tour_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_national_parks_park_id_fkey';
            columns: ['park_id'];
            isOneToOne: false;
            referencedRelation: 'national_parks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tour_national_parks_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_pricing_cells: {
        Row: {
          band_position: number;
          created_at: string;
          group_band: string;
          id: string;
          price: number;
          season_id: string;
        };
        Insert: {
          band_position?: number;
          created_at?: string;
          group_band: string;
          id?: string;
          price: number;
          season_id: string;
        };
        Update: {
          band_position?: number;
          created_at?: string;
          group_band?: string;
          id?: string;
          price?: number;
          season_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_pricing_cells_season_id_fkey';
            columns: ['season_id'];
            isOneToOne: false;
            referencedRelation: 'tour_pricing_seasons';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_pricing_seasons: {
        Row: {
          created_at: string;
          date_end: string | null;
          date_start: string | null;
          id: string;
          label: string;
          position: number;
          tier_id: string;
        };
        Insert: {
          created_at?: string;
          date_end?: string | null;
          date_start?: string | null;
          id?: string;
          label: string;
          position?: number;
          tier_id: string;
        };
        Update: {
          created_at?: string;
          date_end?: string | null;
          date_start?: string | null;
          id?: string;
          label?: string;
          position?: number;
          tier_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_pricing_seasons_tier_id_fkey';
            columns: ['tier_id'];
            isOneToOne: false;
            referencedRelation: 'tour_pricing_tiers';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_pricing_tiers: {
        Row: {
          blurb: string | null;
          created_at: string;
          currency: string;
          id: string;
          label: string | null;
          notes: string | null;
          position: number;
          tier: string;
          tour_id: string;
          updated_at: string;
        };
        Insert: {
          blurb?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          label?: string | null;
          notes?: string | null;
          position?: number;
          tier: string;
          tour_id: string;
          updated_at?: string;
        };
        Update: {
          blurb?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          label?: string | null;
          notes?: string | null;
          position?: number;
          tier?: string;
          tour_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_pricing_tiers_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      tour_translations: {
        Row: {
          canonical_override: string | null;
          created_at: string;
          direct_answers: Json;
          excerpt: string | null;
          faqs: Json;
          id: string;
          locale: string;
          og_image_id: string | null;
          overview: Json | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          title: string;
          tour_id: string;
          updated_at: string;
        };
        Insert: {
          canonical_override?: string | null;
          created_at?: string;
          direct_answers?: Json;
          excerpt?: string | null;
          faqs?: Json;
          id?: string;
          locale: string;
          og_image_id?: string | null;
          overview?: Json | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          title: string;
          tour_id: string;
          updated_at?: string;
        };
        Update: {
          canonical_override?: string | null;
          created_at?: string;
          direct_answers?: Json;
          excerpt?: string | null;
          faqs?: Json;
          id?: string;
          locale?: string;
          og_image_id?: string | null;
          overview?: Json | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          title?: string;
          tour_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tour_translations_og_image_id_fkey';
            columns: ['og_image_id'];
            isOneToOne: false;
            referencedRelation: 'media_assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tour_translations_tour_id_fkey';
            columns: ['tour_id'];
            isOneToOne: false;
            referencedRelation: 'tours';
            referencedColumns: ['id'];
          }
        ];
      };
      tours: {
        Row: {
          catalog_group: string | null;
          countries: string[];
          created_at: string;
          days: number | null;
          end_location: string | null;
          exclusions: Json;
          highlights: Json;
          id: string;
          important_notice: string | null;
          inclusions: Json;
          itinerary_days: Json;
          nights: number | null;
          price_from: number | null;
          pricing_experience_id: string | null;
          pricing_table_keys: Json;
          route_waypoints: Json;
          start_location: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          catalog_group?: string | null;
          countries?: string[];
          created_at?: string;
          days?: number | null;
          end_location?: string | null;
          exclusions?: Json;
          highlights?: Json;
          id?: string;
          important_notice?: string | null;
          inclusions?: Json;
          itinerary_days?: Json;
          nights?: number | null;
          price_from?: number | null;
          pricing_experience_id?: string | null;
          pricing_table_keys?: Json;
          route_waypoints?: Json;
          start_location?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          catalog_group?: string | null;
          countries?: string[];
          created_at?: string;
          days?: number | null;
          end_location?: string | null;
          exclusions?: Json;
          highlights?: Json;
          id?: string;
          important_notice?: string | null;
          inclusions?: Json;
          itinerary_days?: Json;
          nights?: number | null;
          price_from?: number | null;
          pricing_experience_id?: string | null;
          pricing_table_keys?: Json;
          route_waypoints?: Json;
          start_location?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tours_pricing_experience_id_fkey';
            columns: ['pricing_experience_id'];
            isOneToOne: false;
            referencedRelation: 'experiences';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      experience_menu_items: {
        Row: {
          experience_id: string | null;
          label: string | null;
          locale: string | null;
          menu_group: string | null;
          menu_position: number | null;
          slug: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      get_portal_team: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          full_name: string | null;
          role: string;
          status: string;
          avatar_url: string | null;
          email: string | null;
          created_at: string;
          last_sign_in_at: string | null;
        }[];
      };
      staff_has_role: { Args: { allowed_roles: string[] }; Returns: boolean };
      submit_enquiry: {
        Args: {
          p_booking_reference?: string | null;
          p_budget?: string | null;
          p_country?: string | null;
          p_destinations?: string | null;
          p_email: string;
          p_enquiry_type: string;
          p_form_data: Json;
          p_locale: string;
          p_message: string;
          p_name: string;
          p_phone: string | null;
          p_preferred_dates?: string | null;
          p_source_path: string | null;
          p_topic?: string | null;
          p_travelers?: number | null;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {}
  }
} as const;
