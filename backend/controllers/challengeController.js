// backend/controllers/challengeController.js
const supabase = require('../config/supabase');

// ========================= EXISTING ENDPOINTS (your original) =========================

// Create new coding challenge
const createChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      project_id,
      title,
      description,
      difficulty_level,
      time_limit_minutes,
      test_cases,
      starter_code,
      expected_solution,
      programming_language_id
    } = req.body;

    if (!title || !description || !programming_language_id) {
      return res.status(400).json({ success: false, message: 'Title, description, and programming language are required' });
    }

    let parsedTestCases;
    try {
      parsedTestCases = typeof test_cases === 'string' ? JSON.parse(test_cases) : test_cases;
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid test cases format. Must be valid JSON.' });
    }

    const { data: challenge, error: challengeError } = await supabase
      .from('coding_challenges')
      .insert({
        project_id: project_id || null,
        title,
        description,
        difficulty_level: difficulty_level || 'easy',
        time_limit_minutes: time_limit_minutes || 30,
        test_cases: parsedTestCases,
        starter_code: starter_code || '',
        expected_solution: expected_solution || '',
        programming_language_id: parseInt(programming_language_id, 10),
        created_by: userId,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        programming_languages (id, name),
        users:created_by (id, username, full_name)
      `)
      .single();

    if (challengeError) {
      console.error('Error creating challenge:', challengeError);
      return res.status(500).json({ success: false, message: 'Failed to create challenge', error: challengeError.message });
    }

    res.status(201).json({ success: true, message: 'Challenge created successfully', data: { challenge } });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get all challenges with filters
const getChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty_level,
      programming_language_id,
      created_by,
      project_id,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name, description),
        users:created_by (id, username, full_name),
        projects (id, title)
      `)
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (difficulty_level) query = query.eq('difficulty_level', difficulty_level);
    if (programming_language_id) query = query.eq('programming_language_id', programming_language_id);
    if (created_by) query = query.eq('created_by', created_by);

    if (project_id) {
      if (project_id === 'null') query = query.is('project_id', null);
      else query = query.eq('project_id', project_id);
    }

    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    const { data: challenges, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: error.message });
    }

    res.json({
      success: true,
      data: {
        challenges,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: challenges.length }
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get challenge by ID
const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: challenge, error } = await supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name, description),
        users:created_by (id, username, full_name, avatar_url),
        projects (id, title, description)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, data: { challenge } });
  } catch (error) {
    console.error('Get challenge by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update challenge
const updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const { data: existingChallenge, error: findError } = await supabase
      .from('coding_challenges')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (findError || !existingChallenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (existingChallenge.created_by !== userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own challenges' });
    }

    if (updateData.test_cases) {
      try {
        updateData.test_cases = typeof updateData.test_cases === 'string'
          ? JSON.parse(updateData.test_cases)
          : updateData.test_cases;
      } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid test cases format' });
      }
    }

    const { data: challenge, error: updateError } = await supabase
      .from('coding_challenges')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        programming_languages (id, name),
        users:created_by (id, username, full_name)
      `)
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, message: 'Failed to update challenge', error: updateError.message });
    }

    res.json({ success: true, message: 'Challenge updated successfully', data: { challenge } });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Delete challenge (soft delete)
const deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existingChallenge, error: findError } = await supabase
      .from('coding_challenges')
      .select('id, created_by, title')
      .eq('id', id)
      .single();

    if (findError || !existingChallenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (existingChallenge.created_by !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own challenges' });
    }

    const { error: deleteError } = await supabase
      .from('coding_challenges')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({ success: false, message: 'Failed to delete challenge', error: deleteError.message });
    }

    res.json({ success: true, message: `Challenge "${existingChallenge.title}" deleted successfully` });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get challenges by programming language
const getChallengesByLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { difficulty_level, project_id } = req.query;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name)
      `)
      .eq('programming_language_id', languageId)
      .eq('is_active', true);

    if (difficulty_level) query = query.eq('difficulty_level', difficulty_level);

    if (project_id) {
      query = query.or(`project_id.is.null,project_id.eq.${project_id}`);
    } else {
      query = query.is('project_id', null);
    }

    const { data: challenges, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: error.message });
    }

    res.json({ success: true, data: { challenges } });
  } catch (error) {
    console.error('Get challenges by language error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get user's challenge attempts
const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data: attempts, error } = await supabase
      .from('challenge_attempts')
      .select(`
        *,
        coding_challenges (id, title, difficulty_level),
        projects (id, title)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch attempts', error: error.message });
    }

    res.json({
      success: true,
      data: {
        attempts,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: attempts.length }
      }
    });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get user's challenge statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: attemptStats, error: statsError } = await supabase
      .from('challenge_attempts')
      .select('status, score')
      .eq('user_id', userId);

    if (statsError) {
      return res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: statsError.message });
    }

    const totalAttempts = attemptStats.length;
    const passedAttempts = attemptStats.filter(a => a.status === 'passed').length;
    const averageScore = totalAttempts > 0
      ? attemptStats.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts
      : 0;

    res.json({
      success: true,
      data: {
        totalAttempts,
        passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageScore: Math.round(averageScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get attempt details
const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const { data: attempt, error } = await supabase
      .from('challenge_attempts')
      .select(`
        *,
        coding_challenges (id, title, description, test_cases),
        projects (id, title)
      `)
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (error || !attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    res.json({ success: true, data: { attempt } });
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ========================= ADAPTIVE SELECTION (NEW) =========================

const mapDifficultyToElo = (level) => {
  const lv = String(level || '').toLowerCase();
  if (lv.includes('expert')) return 1600;
  if (lv.includes('hard') || lv.includes('advanced')) return 1450;
  if (lv.includes('medium') || lv.includes('intermediate')) return 1250;
  return 1100;
};

async function getPrimaryLanguageId(userId) {
  const { data: rows } = await supabase
    .from('user_programming_languages')
    .select('language_id, proficiency_level, years_experience, programming_languages(name)')
    .eq('user_id', userId);

  if (!rows?.length) return null;

  const scoreRow = (r) => {
    const level = String(r.proficiency_level || '').toLowerCase();
    const levelScore = level === 'expert' ? 4 : level === 'advanced' ? 3 : level === 'intermediate' ? 2 : 1;
    const years = Number(r.years_experience) || 0;
    return levelScore * 10 + Math.min(6, years);
  };

  rows.sort((a, b) => scoreRow(b) - scoreRow(a));
  return rows[0].language_id || null;
}

async function getUserElo(userId, languageId) {
  const { data: row } = await supabase
    .from('user_skill_ratings')
    .select('rating, attempts')
    .eq('user_id', userId)
    .eq('programming_language_id', languageId)
    .single();

  if (row) return row;

  await supabase.from('user_skill_ratings').upsert({
    user_id: userId,
    programming_language_id: languageId,
    rating: 1200,
    attempts: 0
  });

  return { rating: 1200, attempts: 0 };
}

async function getChallengeRatings(challengeIds, challengesById) {
  if (!challengeIds.length) return new Map();

  const { data: rows } = await supabase
    .from('challenge_ratings')
    .select('challenge_id, rating, attempts, pass_count')
    .in('challenge_id', challengeIds);

  const map = new Map();
  for (const id of challengeIds) {
    const row = rows?.find(r => r.challenge_id === id);
    if (row) {
      map.set(id, row);
    } else {
      const ch = challengesById.get(id);
      map.set(id, {
        challenge_id: id,
        rating: mapDifficultyToElo(ch?.difficulty_level),
        attempts: 0,
        pass_count: 0
      });
    }
  }
  return map;
}

const getNextChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    let { programming_language_id, project_id } = req.query;
    programming_language_id = programming_language_id ? parseInt(programming_language_id, 10) : null;

    if (!programming_language_id) {
      programming_language_id = await getPrimaryLanguageId(userId);
    }

    let query = supabase
      .from('coding_challenges')
      .select(`
        id, title, description, difficulty_level, programming_language_id, project_id,
        programming_languages ( id, name )
      `)
      .eq('is_active', true);

    if (programming_language_id) query = query.eq('programming_language_id', programming_language_id);
    if (project_id) query = query.or(`project_id.is.null,project_id.eq.${project_id}`);
    else query = query.is('project_id', null);

    const { data: candidates, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch candidates', error: error.message });
    }
    if (!candidates?.length) {
      return res.json({ success: true, data: null, reason: 'No challenges available for this filter' });
    }

    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase
      .from('challenge_attempts')
      .select('challenge_id, status, started_at')
      .eq('user_id', userId)
      .gte('started_at', since);

    const recentlyAttempted = new Set((recentAttempts || []).map(a => a.challenge_id));
    const filtered = candidates.filter(c => !recentlyAttempted.has(c.id));
    const finalCandidates = filtered.length ? filtered : candidates;

    const byId = new Map(finalCandidates.map(c => [c.id, c]));
    const challengeIds = finalCandidates.map(c => c.id);
    const crMap = await getChallengeRatings(challengeIds, byId);
    const { rating: userRating, attempts: userAttempts } = await getUserElo(
      userId,
      programming_language_id || finalCandidates[0].programming_language_id
    );

    const totalUserLangAttempts = userAttempts || (recentAttempts?.length || 0);
    const scored = finalCandidates.map(ch => {
      const cr = crMap.get(ch.id);
      const fit = 1000 - Math.abs((cr?.rating || 1200) - userRating);
      const globalTries = (cr?.attempts || 0);
      const explore = Math.log((totalUserLangAttempts + 2)) / Math.sqrt(globalTries + 1);
      const score = fit + (explore * 50);
      return {
        challenge: ch,
        score,
        details: {
          fitDelta: Math.abs((cr?.rating || 1200) - userRating),
          estChallengeElo: cr?.rating || mapDifficultyToElo(ch.difficulty_level),
          estUserElo: userRating,
          exploreBoost: Number((explore * 50).toFixed(1))
        }
      };
    });

    scored.sort((a, b) => (b.score - a.score) || (Math.random() - 0.5));
    const best = scored[0];

    const languageName = best.challenge.programming_languages?.name || 'this language';
    const diffLabel = best.challenge.difficulty_level || 'unknown';
    const reason = [
      `Targeting your level in ${languageName} (Δ=${Math.round(best.details.fitDelta)} ELO)`,
      `Difficulty: ${diffLabel}`,
      best.details.exploreBoost > 0 ? 'Exploring a less-seen challenge to broaden coverage' : 'High fit based on your history'
    ].join(' • ');

    return res.json({ success: true, data: { challenge: best.challenge, reason, diagnostics: best.details } });
  } catch (err) {
    console.error('getNextChallenge error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

const updateSkillRatings = async ({ userId, challengeId, programming_language_id, pass }) => {
  const Kbase = 32;

  const { data: u } = await supabase
    .from('user_skill_ratings').select('rating, attempts')
    .eq('user_id', userId).eq('programming_language_id', programming_language_id).single();

  const userRating = u?.rating ?? 1200;
  const userAttempts = u?.attempts ?? 0;

  const { data: c } = await supabase
    .from('challenge_ratings').select('rating, attempts, pass_count')
    .eq('challenge_id', challengeId).single();

  let chRating = c?.rating;
  if (chRating == null) {
    const { data: chRow } = await supabase.from('coding_challenges').select('difficulty_level').eq('id', challengeId).single();
    chRating = mapDifficultyToElo(chRow?.difficulty_level);
  }
  const chAttempts = c?.attempts ?? 0;
  const chPass = c?.pass_count ?? 0;

  const expectedUser = 1 / (1 + Math.pow(10, (chRating - userRating) / 400));
  const S = pass ? 1 : 0;

  const Kuser = Math.max(16, Kbase - Math.floor(userAttempts / 5));
  const Kch = Math.max(12, Kbase - Math.floor(chAttempts / 10));

  const newUser = Math.round(userRating + Kuser * (S - expectedUser));
  const newCh = Math.round(chRating + Kch * ((1 - S) - (1 - expectedUser)));

  await supabase.from('user_skill_ratings').upsert({
    user_id: userId,
    programming_language_id,
    rating: newUser,
    attempts: userAttempts + 1,
    last_updated: new Date().toISOString()
  });

  await supabase.from('challenge_ratings').upsert({
    challenge_id: challengeId,
    rating: newCh,
    attempts: chAttempts + 1,
    pass_count: chPass + (pass ? 1 : 0),
    last_updated: new Date().toISOString()
  });
};

// ========================= EXPORTS =========================
module.exports = {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengesByLanguage,
  getUserAttempts,
  getUserStats,
  getAttemptDetails,
  // new
  getNextChallenge,
  updateSkillRatings
};