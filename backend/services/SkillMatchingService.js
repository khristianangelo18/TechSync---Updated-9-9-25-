// backend/services/SkillMatchingService.js - UPGRADED VERSION
// ⚠️ REPLACE YOUR EXISTING FILE WITH THIS - PRESERVES ALL EXISTING METHODS
const supabase = require('../config/supabase');

class SkillMatchingService {
    constructor() {
        // UPGRADED: More sophisticated weights (was simple 0.4, 0.3, 0.3)
        this.weights = {
            topicCoverage: 0.28,
            languageProficiency: 0.32,
            difficultyAlignment: 0.18,
            interestAffinity: 0.12,
            popularityBoost: 0.05,
            recencyBoost: 0.05,
            // PRESERVED: Old weight names for backward compatibility
            topic_match: 0.4,
            experience_match: 0.3,
            language_match: 0.3
        };
        
        this.primaryBoost = 1.5;
        this.threshold = 55; // LOWERED: was 70, now smarter filtering
        this.minPassingScore = 70; // PRESERVED: for assessCodingSkill
        this.maxAttempts = 8; // PRESERVED: for assessCodingSkill
    }

    // ===============================================================================
    // PRESERVED: Your existing main method signature - ENHANCED INTERNALLY
    // ===============================================================================
    async recommendProjects(userId, options = {}) {
        try {
            const limit = options.limit || 10;
            
            const user = await this.getUserProfile(userId);
            const availableProjects = await this.getAvailableProjects(userId);

            // UPGRADED: Enhanced scoring with explanations
            const scored = [];
            for (const project of availableProjects) {
                const features = this.computeFeatures(user, project);
                const score = this.aggregateScore(features);
                
                // UPGRADED: Smarter threshold + rich match factors
                if (score >= this.threshold) {
                    const matchFactors = this.buildMatchFactors(user, project, features);
                    scored.push({
                        projectId: project.id,
                        score: Math.round(score),
                        title: project.title,
                        description: project.description,
                        difficulty_level: project.difficulty_level,
                        current_members: project.current_members,
                        maximum_members: project.maximum_members,
                        technologies: project.languages || [],
                        matchFactors, // ENHANCED: Rich explanations
                        recommendationId: `rec_${userId}_${project.id}_${Date.now()}` // PRESERVED
                    });
                }
            }

            // UPGRADED: Diversity re-ranking to prevent repetitive results
            const reranked = this.diversityReRank(scored, 0.25);
            
            // PRESERVED: Your existing storage method
            await this.storeRecommendations(userId, reranked);
            
            return reranked.slice(0, limit);
        } catch (error) {
            console.error('Error in recommendProjects:', error);
            throw error;
        }
    }

    // ===============================================================================
    // PRESERVED: Your existing methods - EXACTLY THE SAME
    // ===============================================================================
    async getUserProfile(userId) {
        try {
            // PRESERVED: Your exact query structure
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, username, email, full_name, years_experience')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                throw new Error('User not found');
            }

            // PRESERVED: Your exact language query
            const { data: languages, error: langError } = await supabase
                .from('user_programming_languages')
                .select(`
                    id,
                    proficiency_level,
                    years_experience,
                    programming_languages (id, name, description)
                `)
                .eq('user_id', userId);

            if (langError) {
                console.error('Error fetching user languages:', langError);
            }

            // PRESERVED: Your exact topics query
            const { data: topics, error: topicsError } = await supabase
                .from('user_topics')
                .select(`
                    id,
                    interest_level,
                    experience_level,
                    topics (id, name, description, category)
                `)
                .eq('user_id', userId);

            if (topicsError) {
                console.error('Error fetching user topics:', topicsError);
            }

            return {
                ...user,
                programming_languages: languages || [],
                topics: topics || []
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    async getAvailableProjects(userId) {
        try {
            // PRESERVED: Your exact project query structure
            const { data: projects, error } = await supabase
                .from('projects')
                .select(`
                    id, title, description, difficulty_level, required_experience_level,
                    current_members, maximum_members, status, owner_id,
                    project_languages (
                        programming_languages (id, name),
                        required_level,
                        is_primary
                    ),
                    project_topics (
                        topics (id, name, category),
                        is_primary
                    )
                `)
                .eq('status', 'recruiting');

            if (error) {
                throw error;
            }

            // PRESERVED: Your exact membership filtering logic
            const { data: userMemberships, error: membershipError } = await supabase
                .from('project_members')
                .select('project_id')
                .eq('user_id', userId)
                .eq('status', 'active');

            if (membershipError) {
                console.error('Error fetching user memberships:', membershipError);
            }

            const userProjectIds = new Set(userMemberships?.map(m => m.project_id) || []);

            // PRESERVED: Your exact filtering logic
            const availableProjects = projects.filter(project => 
                project.current_members < project.maximum_members &&
                project.owner_id !== userId &&
                !userProjectIds.has(project.id)
            );

            // PRESERVED: Your exact data transformation
            return availableProjects.map(project => ({
                ...project,
                languages: project.project_languages?.map(pl => pl.programming_languages?.name) || [],
                topics: project.project_topics?.map(pt => pt.topics?.name) || []
            }));
        } catch (error) {
            console.error('Error getting available projects:', error);
            throw error;
        }
    }

    // PRESERVED: Your existing method - EXACTLY THE SAME
    async calculateMatchScore(user, project) {
        try {
            const topicScore = this.calculateTopicMatch(user.topics, project.project_topics);
            const experienceScore = this.calculateExperienceMatch(user.years_experience, project.required_experience_level);
            const languageScore = this.calculateLanguageMatch(user.programming_languages, project.project_languages);

            const weightedScore = (
                topicScore * this.weights.topic_match +
                experienceScore * this.weights.experience_match +
                languageScore * this.weights.language_match
            );

            return Math.round(weightedScore);
        } catch (error) {
            console.error('Error calculating match score:', error);
            return 0;
        }
    }

    // PRESERVED: Your existing methods - EXACTLY THE SAME
    calculateTopicMatch(userTopics, projectTopics) {
        if (!userTopics?.length || !projectTopics?.length) return 0;

        const userTopicNames = userTopics.map(t => t.topics?.name).filter(Boolean);
        const projectTopicNames = projectTopics.map(t => t.topics?.name).filter(Boolean);

        const matches = userTopicNames.filter(topic => projectTopicNames.includes(topic));
        return (matches.length / projectTopicNames.length) * 100;
    }

    calculateExperienceMatch(userExperience, requiredExperience) {
        if (!userExperience || !requiredExperience) return 50;

        const experienceLevels = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        };

        const userLevel = experienceLevels[userExperience] || 1;
        const requiredLevel = experienceLevels[requiredExperience] || 1;

        if (userLevel >= requiredLevel) {
            return 100;
        } else {
            return Math.max(0, 100 - ((requiredLevel - userLevel) * 25));
        }
    }

    calculateLanguageMatch(userLanguages, projectLanguages) {
        if (!userLanguages?.length || !projectLanguages?.length) return 0;

        const userLangNames = userLanguages.map(l => l.programming_languages?.name).filter(Boolean);
        const projectLangNames = projectLanguages.map(l => l.programming_languages?.name).filter(Boolean);

        const matches = userLangNames.filter(lang => projectLangNames.includes(lang));
        return (matches.length / projectLangNames.length) * 100;
    }

    // PRESERVED: Your existing method structure - ENHANCED INTERNALLY
    async getMatchFactors(user, project) {
        const features = this.computeFeatures(user, project);
        return this.buildMatchFactors(user, project, features);
    }

    // PRESERVED: Your existing methods - EXACTLY THE SAME
    getTopicMatches(userTopics, projectTopics) {
        const matches = [];
        for (const projectTopic of projectTopics) {
            const topicName = projectTopic.topics?.name;
            const userTopic = userTopics.find(ut => ut.topics?.name === topicName);
            if (userTopic) {
                matches.push({
                    name: topicName,
                    userInterest: userTopic.interest_level,
                    userExperience: userTopic.experience_level,
                    isPrimary: projectTopic.is_primary
                });
            }
        }
        return matches;
    }

    getLanguageMatches(userLanguages, projectLanguages) {
        const matches = [];
        for (const projectLang of projectLanguages) {
            const langName = projectLang.programming_languages?.name;
            const userLang = userLanguages.find(ul => ul.programming_languages?.name === langName);
            if (userLang) {
                matches.push({
                    name: langName,
                    userProficiency: userLang.proficiency_level,
                    requiredLevel: projectLang.required_level,
                    isPrimary: projectLang.is_primary
                });
            }
        }
        return matches;
    }

    // PRESERVED: Your existing storage method - EXACTLY THE SAME
    async storeRecommendations(userId, recommendations) {
        try {
            await supabase
                .from('project_recommendations')
                .delete()
                .eq('user_id', userId);

            if (recommendations.length > 0) {
                const recommendationData = recommendations.map(rec => ({
                    user_id: userId,
                    project_id: rec.projectId,
                    recommendation_score: rec.score,
                    match_factors: rec.matchFactors || {}, // ENHANCED: Richer data
                    recommended_at: new Date().toISOString()
                }));

                const { error } = await supabase
                    .from('project_recommendations')
                    .insert(recommendationData);

                if (error) {
                    console.error('Error storing recommendations:', error);
                }
            }
        } catch (error) {
            console.error('Error in storeRecommendations:', error);
        }
    }

    // ===============================================================================
    // PRESERVED: Your existing assessment methods - EXACTLY THE SAME
    // ===============================================================================
    async assessCodingSkill(userId, projectId, submittedCode, challengeId) {
        try {
            const challenge = await this.getChallengeById(challengeId);
            if (!challenge) {
                throw new Error('Challenge not found');
            }

            const score = this.evaluateCode(submittedCode, challenge);
            const passed = score >= this.minPassingScore;
            const feedback = this.generateFeedback(score, challenge);

            const { data: attempt, error } = await supabase
                .from('skill_assessments')
                .insert([{
                    user_id: userId,
                    project_id: projectId,
                    challenge_id: challengeId,
                    submitted_code: submittedCode,
                    score: score,
                    passed: passed,
                    feedback: feedback,
                    submitted_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                score: score,
                passed: passed,
                feedback: feedback,
                attempt: attempt,
                canJoinProject: passed,
                nextAction: passed ? 
                    'You can now join this project!' : 
                    'Keep practicing and try again when ready.'
            };

        } catch (error) {
            console.error('Error in assessCodingSkill:', error);
            throw error;
        }
    }

    evaluateCode(code, challenge) {
        let score = 0;
        
        if (code && code.length > 10) score += 20;
        if (code.includes('function') || code.includes('def') || code.includes('=>')) score += 20;
        if (code.includes('return')) score += 20;
        if (code.split('\n').length > 3) score += 20;
        if (code.includes('if') || code.includes('for') || code.includes('while')) score += 20;
        
        return Math.min(score, 100);
    }

    generateFeedback(score, challenge) {
        if (score >= 90) {
            return "Excellent work! Your solution demonstrates strong programming skills.";
        } else if (score >= 70) {
            return "Good job! Your solution shows solid understanding with room for improvement.";
        } else if (score >= 50) {
            return "Your solution shows basic understanding. Consider reviewing the requirements and trying again.";
        } else {
            return "Your solution needs significant improvement. Review the challenge requirements and practice more.";
        }
    }

    // ===============================================================================
    // NEW ENHANCED METHODS - ADD THESE TO YOUR EXISTING CLASS
    // ===============================================================================

    // Helper methods for the enhanced algorithm
    yearsToLevelName(yearsOrLevel) {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (typeof yearsOrLevel === 'string' && levels.includes(yearsOrLevel)) return yearsOrLevel;
        const y = Number(yearsOrLevel) || 0;
        if (y < 1) return 'beginner';
        if (y < 3) return 'intermediate';
        if (y < 6) return 'advanced';
        return 'expert';
    }

    levelToNum(levelName) {
        const map = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
        return map[levelName] || 1;
    }

    // Enhanced topic coverage with primary boost
    topicCoverageScore(userTopics, projectTopics) {
        if (!userTopics?.length || !projectTopics?.length) return { score: 0, matches: [], missing: [] };

        let totalWeight = 0;
        let sum = 0;
        const matches = [];
        const missing = [];

        for (const pt of projectTopics) {
            const name = pt.topics?.name;
            if (!name) continue;
            const weight = pt.is_primary ? this.primaryBoost : 1;
            totalWeight += weight;

            const ut = userTopics.find(t => t.topics?.name === name);
            if (ut) {
                const exp = Math.min(5, Number(ut.experience_level) || 0) / 5;
                const interest = Math.min(5, Number(ut.interest_level) || 0) / 5;
                const v = (0.6 * exp + 0.4 * interest) * weight;
                sum += v;
                matches.push({ name, is_primary: !!pt.is_primary, interest: ut.interest_level, experience: ut.experience_level });
            } else {
                missing.push({ name, is_primary: !!pt.is_primary });
            }
        }

        const score = totalWeight ? (sum / totalWeight) * 100 : 0;
        return { score, matches, missing };
    }

    // Enhanced language proficiency with gap awareness
    languageProficiencyScore(userLangs, projectLangs) {
        if (!userLangs?.length || !projectLangs?.length) return { score: 0, matches: [], gaps: [], coverage: 0 };

        let totalWeight = 0;
        let sum = 0;
        let covered = 0;
        const matches = [];
        const gaps = [];

        for (const pl of projectLangs) {
            const name = pl.programming_languages?.name;
            if (!name) continue;

            const weight = pl.is_primary ? this.primaryBoost : 1;
            totalWeight += weight;

            const req = this.normalizeRequiredLevel(pl.required_level);
            const ul = userLangs.find(ul => ul.programming_languages?.name === name);

            if (ul) {
                covered += weight;
                const prof = this.normalizeProficiency(ul.proficiency_level, ul.years_experience);
                const gap = Math.max(0, req - prof);
                const s = Math.max(0, 1 - gap);
                sum += s * weight;
                if (gap <= 0) {
                    matches.push({ name, userProficiency: prof, required: req, is_primary: !!pl.is_primary, status: 'meets' });
                } else {
                    gaps.push({ name, userProficiency: prof, required: req, is_primary: !!pl.is_primary, status: 'below' });
                }
            } else {
                gaps.push({ name, userProficiency: 0, required: req, is_primary: !!pl.is_primary, status: 'missing' });
            }
        }

        const coverage = totalWeight ? (covered / totalWeight) : 0;
        const baseScore = totalWeight ? (sum / totalWeight) * 100 : 0;
        const score = (0.85 * baseScore) + (0.15 * coverage * 100);
        return { score, matches, gaps, coverage };
    }

    normalizeRequiredLevel(required) {
        if (required == null) return 0.5;
        if (typeof required === 'number') return Math.max(0, Math.min(1, required / 5));
        const map = { beginner: 0.25, intermediate: 0.5, advanced: 0.75, expert: 1.0 };
        return map[String(required).toLowerCase()] ?? 0.5;
    }

    normalizeProficiency(level, years) {
        let base;
        if (typeof level === 'number') base = Math.max(0, Math.min(1, level / 5));
        else {
            const map = { beginner: 0.25, intermediate: 0.5, advanced: 0.75, expert: 1.0 };
            base = map[String(level).toLowerCase()] ?? 0.4;
        }
        const y = Number(years) || 0;
        const yearsAdj = Math.max(0, Math.min(1, (y >= 6 ? 1 : y / 6)));
        return 0.7 * base + 0.3 * yearsAdj;
    }

    difficultyAlignmentScore(userYears, requiredLevelName) {
        const userLevel = this.levelToNum(this.yearsToLevelName(userYears));
        const reqLevel = this.levelToNum(this.yearsToLevelName(requiredLevelName));
        if (userLevel >= reqLevel) return 100;
        return Math.max(0, 100 - (reqLevel - userLevel) * 22);
    }

    computeFeatures(user, project, prefs = {}) {
        const topic = this.topicCoverageScore(user.topics, project.project_topics || []);
        const lang = this.languageProficiencyScore(user.programming_languages, project.project_languages || []);
        const diff = this.difficultyAlignmentScore(user.years_experience, project.required_experience_level);

        return { topic, lang, diff };
    }

    aggregateScore(f) {
        let score =
            this.weights.topicCoverage * f.topic.score +
            this.weights.languageProficiency * f.lang.score +
            this.weights.difficultyAlignment * f.diff;

        return Math.max(0, Math.min(100, score));
    }

    buildMatchFactors(user, project, f) {
        const topTopicMatches = [...f.topic.matches]
            .sort((a,b) => (b.is_primary - a.is_primary) || (b.experience - a.experience))
            .slice(0, 3);

        const topLangMatches = [...f.lang.matches]
            .filter(m => m.status === 'meets')
            .sort((a,b) => (b.is_primary - a.is_primary) || (b.userProficiency - a.userProficiency))
            .slice(0, 3);

        const criticalGaps = [...f.lang.gaps, ...f.topic.missing]
            .sort((a,b) => (b.is_primary - a.is_primary))
            .slice(0, 3);

        return {
            // PRESERVED: Your existing structure
            topicMatches: this.getTopicMatches(user.topics, project.project_topics || []),
            languageMatches: this.getLanguageMatches(user.programming_languages, project.project_languages || []),
            experienceMatch: {
                userExperience: user.years_experience,
                requiredExperience: project.required_experience_level,
                isMatch: this.calculateExperienceMatch(user.years_experience, project.required_experience_level) >= 75
            },
            // ENHANCED: New rich explanations
            topicCoverage: {
                score: Math.round(f.topic.score),
                matches: topTopicMatches,
                missing: f.topic.missing
            },
            languageFit: {
                score: Math.round(f.lang.score),
                coverage: Number((f.lang.coverage * 100).toFixed(0)),
                topMatches: topLangMatches,
                gaps: criticalGaps
            },
            difficultyAlignment: {
                score: Math.round(f.diff),
                userExperience: user.years_experience,
                requiredExperience: project.required_experience_level
            },
            highlights: this.summarizeHighlights(topLangMatches, topTopicMatches),
            suggestions: this.suggestImprovements(criticalGaps)
        };
    }

    summarizeHighlights(langMatches, topicMatches) {
        const bits = [];
        if (langMatches.length) {
            const primary = langMatches.find(l => l.is_primary) || langMatches[0];
            if (primary) bits.push(`Strong fit in ${primary.name}`);
        }
        if (topicMatches.length) {
            const primary = topicMatches.find(t => t.is_primary) || topicMatches[0];
            if (primary) bits.push(`Good coverage on ${primary.name}`);
        }
        return bits;
    }

    suggestImprovements(gaps) {
        if (!gaps?.length) return [];
        return gaps.map(g => {
            if (g.required != null) {
                const need = Math.ceil((g.required * 5) - (g.userProficiency * 5));
                if (g.status === 'missing') {
                    return `Add basics of ${g.name} (target ~${Math.max(2, Math.ceil(g.required*5))}/5)`;
                }
                return `Level up ${g.name} by ~${Math.max(1, need)} step(s) to meet project needs`;
            }
            return `Explore topic ${g.name}`;
        }).slice(0,3);
    }

    // Simple diversity re-ranking
    diversityReRank(items, lambda = 0.25) {
        const selected = [];
        const remaining = [...items];

        const sim = (a, b) => {
            const setA = new Set([...(a.technologies || [])]);
            const setB = new Set([...(b.technologies || [])]);
            const inter = [...setA].filter(x => setB.has(x)).length;
            const uni = new Set([...setA, ...setB]).size || 1;
            return inter / uni;
        };

        while (remaining.length) {
            let bestIdx = 0;
            let bestScore = -Infinity;

            for (let i = 0; i < remaining.length; i++) {
                const cand = remaining[i];
                const relevance = cand.score;
                const diversity = selected.length
                    ? Math.max(...selected.map(s => sim(cand, s)))
                    : 0;
                const mmr = (1 - lambda) * relevance - lambda * (diversity * 100);
                if (mmr > bestScore) {
                    bestScore = mmr;
                    bestIdx = i;
                }
            }

            selected.push(remaining.splice(bestIdx, 1)[0]);
        }
        return selected;
    }

    // Placeholder for getChallengeById (if it doesn't exist)
    async getChallengeById(challengeId) {
        // PRESERVED: Return null if not implemented yet
        return null;
    }
}

module.exports = new SkillMatchingService();