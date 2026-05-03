-- Real Transformation Data with actual fitness before/after images
-- Run this in your Supabase SQL Editor
-- This REPLACES placeholder transformation data with real-looking ones

DELETE FROM transformations;

INSERT INTO transformations (name, duration, before_image, after_image) VALUES
(
  'Ahmed M.',
  '6 Months',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80'
),
(
  'Sara K.',
  '4 Months',
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80',
  'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=600&q=80'
),
(
  'Mohamed R.',
  '8 Months',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80'
),
(
  'Laila H.',
  '5 Months',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80'
);
