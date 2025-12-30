/**
 * Supabase Configuration for EcoVenture
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project
 * 3. Go to Settings > API and copy your Project URL and anon/public key
 * 4. Replace the placeholders below with your actual credentials
 * 5. Go to Authentication > Settings and enable Email auth
 * 6. Run the SQL below in your Supabase SQL Editor to create tables
 */

// Supabase credentials
const SUPABASE_URL = 'https://bxcqncqyyfopjwshriua.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Y3FuY3F5eWZvcGp3c2hyaXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTMxNTAsImV4cCI6MjA4MDg2OTE1MH0.hSn-tEYxPdEH7UkwaKuc9yA_Ug_BKLRM43kXYH-fOW0';

/*
SQL to run in Supabase SQL Editor:

-- Users profile table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  area TEXT,
  country TEXT,
  friend_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Submissions table for tracking pickups
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  points_earned INTEGER NOT NULL,
  items_detected TEXT[],
  location_area TEXT,
  location_country TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friendships table
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  friend_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can send friend requests
CREATE POLICY "Users can insert friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they received (accept/reject)
CREATE POLICY "Users can update received friendships" ON friendships
  FOR UPDATE USING (auth.uid() = friend_id);

-- Users can delete their own friendships
CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Function to update profile on submission
CREATE OR REPLACE FUNCTION update_profile_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    total_points = total_points + NEW.points_earned,
    lifetime_points = lifetime_points + NEW.points_earned,
    submissions = submissions + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating profile
CREATE TRIGGER on_submission_created
  AFTER INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_profile_on_submission();

-- Function to generate friend code on profile creation
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.friend_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for generating friend code
CREATE TRIGGER on_profile_created
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_friend_code();

-- Cleanup Events table
CREATE TABLE cleanup_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  bonus_points INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for cleanup_events
ALTER TABLE cleanup_events ENABLE ROW LEVEL SECURITY;

-- Everyone can view cleanup events
CREATE POLICY "Cleanup events are viewable by everyone" ON cleanup_events
  FOR SELECT USING (true);

-- Users can create their own events
CREATE POLICY "Users can create cleanup events" ON cleanup_events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events" ON cleanup_events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Cleanup Attendees table
CREATE TABLE cleanup_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES cleanup_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  attended BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  points_awarded INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS for cleanup_attendees
ALTER TABLE cleanup_attendees ENABLE ROW LEVEL SECURITY;

-- Everyone can view attendees
CREATE POLICY "Attendees are viewable by everyone" ON cleanup_attendees
  FOR SELECT USING (true);

-- Users can join events
CREATE POLICY "Users can join events" ON cleanup_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own attendance
CREATE POLICY "Users can update own attendance" ON cleanup_attendees
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can leave events
CREATE POLICY "Users can leave events" ON cleanup_attendees
  FOR DELETE USING (auth.uid() = user_id);

*/

// Supabase client initialization
let supabase = null;

function initSupabase() {
  if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
  }
  return null;
}

// Auth functions
async function signUp(email, password, username, displayName) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName
      }
    }
  });

  if (authError) throw authError;

  // Create profile
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        display_name: displayName
      });

    if (profileError) console.error('Profile creation error:', profileError);
  }

  return authData;
}

async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

async function signOut() {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function getCurrentUser() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getSession() {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function getUserProfile(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Profile not found');
  return data;
}

async function updateUserProfile(userId, updates) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateUserArea(userId, area, country) {
  return updateUserProfile(userId, { area, country });
}

// Leaderboard functions
async function getAreaLeaderboard(area, limit = 50) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, total_points, submissions, current_streak')
    .eq('area', area)
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

async function getGlobalLeaderboard(limit = 50) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, total_points, submissions, current_streak, area, country')
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

async function getUserRank(userId, area = null) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Get user's points
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('total_points')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  // Count users with more points
  let query = supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gt('total_points', user.total_points);

  if (area) {
    query = query.eq('area', area);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count + 1;
}

// Submission functions
async function createSubmission(userId, pointsEarned, itemsDetected, locationArea, locationCountry) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      user_id: userId,
      points_earned: pointsEarned,
      items_detected: itemsDetected,
      location_area: locationArea,
      location_country: locationCountry,
      verified: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// Friends System
// ========================================

// Search for users by username or friend code
async function searchUsers(query) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, total_points, friend_code')
    .or(`username.ilike.%${query}%,friend_code.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
}

// Get user by friend code
async function getUserByFriendCode(friendCode) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, total_points, friend_code')
    .eq('friend_code', friendCode.toUpperCase())
    .single();

  if (error) throw error;
  return data;
}

// Send friend request
async function sendFriendRequest(userId, friendId) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Already friends');
    } else if (existing.status === 'pending') {
      throw new Error('Friend request already sent');
    }
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Accept friend request
async function acceptFriendRequest(friendshipId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reject friend request
async function rejectFriendRequest(friendshipId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
}

// Remove friend
async function removeFriend(userId, friendId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

  if (error) throw error;
}

// Get pending friend requests (received)
async function getPendingFriendRequests(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      created_at,
      user_id,
      profiles!friendships_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        total_points
      )
    `)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get sent friend requests
async function getSentFriendRequests(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      created_at,
      friend_id,
      profiles!friendships_friend_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        total_points
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get friends list
async function getFriends(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Get friendships where user is either user_id or friend_id
  const { data, error } = await supabase
    .from('friendships')
    .select('id, user_id, friend_id, created_at')
    .eq('status', 'accepted')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (error) throw error;

  // Get the friend IDs (the other person in each friendship)
  const friendIds = data.map(f => f.user_id === userId ? f.friend_id : f.user_id);

  if (friendIds.length === 0) return [];

  // Get friend profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, total_points, submissions, current_streak')
    .in('id', friendIds)
    .order('total_points', { ascending: false });

  if (profileError) throw profileError;
  return profiles;
}

// Get friends leaderboard
async function getFriendsLeaderboard(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Get friends
  const friends = await getFriends(userId);

  // Get current user profile
  const { data: userProfile, error: userError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, total_points, submissions, current_streak')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  // Combine and sort
  const leaderboard = [...friends, userProfile];
  leaderboard.sort((a, b) => b.total_points - a.total_points);

  return leaderboard;
}

// Get friend count
async function getFriendCount(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { count, error } = await supabase
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (error) throw error;
  return count || 0;
}

// Get pending request count
async function getPendingRequestCount(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { count, error } = await supabase
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return count || 0;
}

// ========================================
// Organized Cleanups System
// ========================================

// Create a cleanup event
async function createCleanupEvent(userId, title, description, location, area, eventDate) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Check if user has created an event in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentEvents, error: checkError } = await supabase
    .from('cleanup_events')
    .select('id')
    .eq('organizer_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (checkError) throw checkError;

  if (recentEvents && recentEvents.length > 0) {
    throw new Error('You can only create one cleanup event per week');
  }

  const { data, error } = await supabase
    .from('cleanup_events')
    .insert({
      organizer_id: userId,
      title,
      description,
      location,
      area,
      event_date: eventDate,
      status: 'upcoming'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get cleanup events in an area
async function getAreaCleanupEvents(area, includeCompleted = false) {
  if (!supabase) throw new Error('Supabase not initialized');

  let query = supabase
    .from('cleanup_events')
    .select(`
      *,
      organizer:profiles!cleanup_events_organizer_id_fkey (
        id, username, display_name, avatar_url
      )
    `)
    .eq('area', area)
    .order('event_date', { ascending: true });

  if (!includeCompleted) {
    query = query.in('status', ['upcoming', 'in_progress']);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Get all upcoming cleanup events
async function getUpcomingCleanupEvents(limit = 20) {
  if (!supabase) throw new Error('Supabase not initialized');

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('cleanup_events')
    .select(`
      *,
      organizer:profiles!cleanup_events_organizer_id_fkey (
        id, username, display_name, avatar_url
      )
    `)
    .gte('event_date', now)
    .in('status', ['upcoming', 'in_progress'])
    .order('event_date', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Get a single cleanup event with attendees
async function getCleanupEvent(eventId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_events')
    .select(`
      *,
      organizer:profiles!cleanup_events_organizer_id_fkey (
        id, username, display_name, avatar_url
      )
    `)
    .eq('id', eventId)
    .single();

  if (error) throw error;
  return data;
}

// Get attendees for an event
async function getEventAttendees(eventId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_attendees')
    .select(`
      *,
      user:profiles!cleanup_attendees_user_id_fkey (
        id, username, display_name, avatar_url, total_points
      )
    `)
    .eq('event_id', eventId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Join a cleanup event (RSVP)
async function joinCleanupEvent(userId, eventId) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Check if already joined
  const { data: existing } = await supabase
    .from('cleanup_attendees')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing) {
    throw new Error('Already joined this event');
  }

  const { data, error } = await supabase
    .from('cleanup_attendees')
    .insert({
      user_id: userId,
      event_id: eventId,
      status: 'going'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Leave a cleanup event
async function leaveCleanupEvent(userId, eventId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('cleanup_attendees')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId);

  if (error) throw error;
}

// Check in to a cleanup event (attended = true)
async function checkInToCleanupEvent(userId, eventId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_attendees')
    .update({
      attended: true,
      checked_in_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user's RSVP status for an event
async function getUserEventStatus(userId, eventId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_attendees')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Get events user is attending
async function getUserCleanupEvents(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_attendees')
    .select(`
      *,
      event:cleanup_events (
        *,
        organizer:profiles!cleanup_events_organizer_id_fkey (
          id, username, display_name, avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get events organized by user
async function getUserOrganizedEvents(userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_events')
    .select('*')
    .eq('organizer_id', userId)
    .order('event_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Cancel a cleanup event (organizer only)
async function cancelCleanupEvent(eventId, userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_events')
    .update({ status: 'cancelled' })
    .eq('id', eventId)
    .eq('organizer_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Complete a cleanup event (organizer only)
async function completeCleanupEvent(eventId, userId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('cleanup_events')
    .update({ status: 'completed' })
    .eq('id', eventId)
    .eq('organizer_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get attendee count for an event
async function getEventAttendeeCount(eventId) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { count, error } = await supabase
    .from('cleanup_attendees')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (error) throw error;
  return count || 0;
}

// Listen for auth changes
function onAuthStateChange(callback) {
  if (!supabase) return null;

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Check if Supabase is configured
function isSupabaseConfigured() {
  return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

// Export functions
window.EcoVentureAuth = {
  init: initSupabase,
  isConfigured: isSupabaseConfigured,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  getUserProfile,
  updateUserProfile,
  updateUserArea,
  getAreaLeaderboard,
  getGlobalLeaderboard,
  getUserRank,
  createSubmission,
  onAuthStateChange,
  // Friends
  searchUsers,
  getUserByFriendCode,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriends,
  getFriendsLeaderboard,
  getFriendCount,
  getPendingRequestCount,
  // Cleanups
  createCleanupEvent,
  getAreaCleanupEvents,
  getUpcomingCleanupEvents,
  getCleanupEvent,
  getEventAttendees,
  joinCleanupEvent,
  leaveCleanupEvent,
  checkInToCleanupEvent,
  getUserEventStatus,
  getUserCleanupEvents,
  getUserOrganizedEvents,
  cancelCleanupEvent,
  completeCleanupEvent,
  getEventAttendeeCount
};
