-- Seed Data for Performance Gym

-- Insert Membership Plans
INSERT INTO membership_plans (name, price, duration, features, is_featured) VALUES
('Monthly', 1600, '1 Month', ARRAY['Full gym access', 'Locker room access', 'Free parking', '1 Guest pass'], false),
('Quarter', 3200, '3 Months', ARRAY['Full gym access', 'Locker room access', 'Free parking', '3 Guest passes', '1 PT session', 'Spa access'], true),
('Semi-Annual', 4500, '6 Months', ARRAY['Full gym access', 'Locker room access', 'Free parking', '6 Guest passes', '2 PT sessions', 'Spa access', '1 Body assessment'], false),
('Annual', 6600, '12 Months', ARRAY['Full gym access', 'Locker room access', 'Free parking', '12 Guest passes', '4 PT sessions', 'Spa access', '2 Body assessments', 'Kickboxing classes'], false);

-- Insert Gym Stats
INSERT INTO gym_stats (active_members, trainers, space_sqm) VALUES
(1500, 25, 1800);

-- Insert Gallery Images (placeholder URLs)
INSERT INTO gallery_images (url, alt, display_order) VALUES
('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', 'Modern gym equipment area', 1),
('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', 'Weight training zone', 2),
('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800', 'Cardio equipment section', 3),
('https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800', 'Boxing and kickboxing area', 4),
('https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800', 'Personal training session', 5),
('https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800', 'Gym interior view', 6);

-- Insert Transformations
INSERT INTO transformations (name, duration, before_image, after_image) VALUES
('Ahmed M.', '6 Months', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'),
('Sara K.', '4 Months', 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400', 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400'),
('Mohamed R.', '8 Months', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400');

-- Insert Testimonials
INSERT INTO testimonials (name, plan, rating, review, avatar) VALUES
('Ahmed Hassan', 'Annual', 5, 'Best gym in the area! The trainers are professional and the equipment is top-notch. Ive transformed my body in just 6 months.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'),
('Sara Mohamed', 'Semi-Annual', 5, 'The spa and kickboxing classes are amazing. I feel stronger and more confident every day.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'),
('Omar Ali', 'Quarter', 4, 'Great atmosphere and clean facilities. The personal training sessions really helped me reach my goals.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'),
('Nour Ibrahim', 'Annual', 5, 'The body assessment program helped me understand my fitness level and create a personalized plan. Highly recommended!', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100');

-- Insert Sample Members
INSERT INTO members (member_id, name, phone, email, plan_id, start_date, end_date, is_frozen, invitations_left, pt_sessions_left, body_assessments_left, kickboxing_sessions_left)
SELECT 
  'PG-2024-001',
  'Ahmed Hassan',
  '01012345678',
  'ahmed@example.com',
  id,
  CURRENT_DATE - INTERVAL '3 months',
  CURRENT_DATE + INTERVAL '9 months',
  false,
  10,
  3,
  2,
  12
FROM membership_plans WHERE name = 'Annual'
LIMIT 1;

INSERT INTO members (member_id, name, phone, email, plan_id, start_date, end_date, is_frozen, invitations_left, pt_sessions_left, body_assessments_left, kickboxing_sessions_left)
SELECT 
  'PG-2024-002',
  'Sara Mohamed',
  '01198765432',
  'sara@example.com',
  id,
  CURRENT_DATE - INTERVAL '2 months',
  CURRENT_DATE + INTERVAL '4 months',
  false,
  4,
  2,
  1,
  0
FROM membership_plans WHERE name = 'Semi-Annual'
LIMIT 1;

INSERT INTO members (member_id, name, phone, email, plan_id, start_date, end_date, is_frozen, invitations_left, pt_sessions_left, body_assessments_left, kickboxing_sessions_left)
SELECT 
  'PG-2024-003',
  'Omar Ali',
  '01234567890',
  'omar@example.com',
  id,
  CURRENT_DATE - INTERVAL '2 months',
  CURRENT_DATE + INTERVAL '5 days',
  false,
  1,
  0,
  0,
  0
FROM membership_plans WHERE name = 'Quarter'
LIMIT 1;

INSERT INTO members (member_id, name, phone, email, plan_id, start_date, end_date, is_frozen, invitations_left, pt_sessions_left, body_assessments_left, kickboxing_sessions_left)
SELECT 
  'PG-2024-004',
  'Nour Ibrahim',
  '01087654321',
  'nour@example.com',
  id,
  CURRENT_DATE - INTERVAL '1 month',
  CURRENT_DATE + INTERVAL '11 months',
  true,
  12,
  4,
  2,
  12
FROM membership_plans WHERE name = 'Annual'
LIMIT 1;
