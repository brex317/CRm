export type Platform = 'LinkedIn' | 'Website' | 'Email' | 'Other social media' | 'Other';
export type ContentFormat = 'Post' | 'Article' | 'Video' | 'Newsletter' | 'Graphic' | 'Infographic' | 'Other';
export type ContentStatus = 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Cancelled';
export type DesignSource = 'Internal' | 'External';

export interface ContentItem {
  content_id: number;
  content_code?: string;
  activity_id: number;
  activity_title?: string;
  title: string;
  topic?: string;
  platform: Platform;
  content_format: ContentFormat;
  planned_publish_date: string;
  actual_publish_date?: string;
  drafted_by?: string;
  design_source?: DesignSource;
  status: ContentStatus;
  revision_no: number;
  approved_by?: string;
  approved_date?: string;
  published_url?: string;
  attachment?: string;

  // Performance metrics
  impressions?: number;
  reach?: number;
  clicks?: number;
  engagements?: number;
  metrics_updated_on?: string;
}

