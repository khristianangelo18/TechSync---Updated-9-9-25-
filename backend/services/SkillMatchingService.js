// backend/services/SkillMatchingService.js
const supabase = require('../config/supabase');

class SkillMatchingService {
    constructor() {
        this.weights = {
            topic_match: 0.4,
            experience_match: 0.3,
            language_match: 0.3
        };
        this.minPassingScore = 70;
        this.maxAttempts = 8;
    }

    /**
     * Main recommendation function
     */
    async recommendProjects(userId) {
        try {
            const user = await this.getUserProfile(userId);
            const availableProjects = await this.getAvailableProjects();
            
            const recommendations = [];
            
            for (const project of availableProjects) {
                const score = await this.calculateMatchScore(user, project);
                if (score > 50) { // Minimum threshold
                    recommendations.push({
                        projectId: project.id,
                        score: score,
                        title: project.title,
                        description: project.description,
                        difficulty_level: project.difficulty_level,
                        current_members: project.current_members,
                        maximum_members: project.maximum_members,
                        technologies: project.languages || [],
                        matchFactors: await this.getMatchFactors(user, project),
                        recommendationId: `rec_${userId}_${project.id}_${Date.now()}`
                    });
                }
            }
            
            // Sort by score descending
            recommendations.sort((a, b) => b.score - a.score);
            
            // Store recommendations
            await this.storeRecommendations(userId, recommendations);
            
            return recommendations.slice(0, 10); // Top 10 recommendations
        } catch (error) {
            console.error('Error in recommendProjects:', error);
            throw error;
        }
    }

    /**
     * Get user profile with programming languages and topics
     */
    async getUserProfile(userId) {
        try {
            // Get user basic info
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, username, email, full_name, years_experience')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                throw new Error('User not found');
            }

            // Get user's programming languages
            const { data: languages } = await supabase
                .from('user_programming_languages')
                .select(`
                    id,
                    proficiency_level,
                    years_experience,
                    programming_languages (id, name, description)
                `)
                .eq('user_id', userId);

            // Get user's topics
            const { data: topics } = await supabase
                .from('user_topics')
                .select(`
                    id,
                    interest_level,
                    experience_level,
                    topics (id, name, description, category)
                `)
                .eq('user_id', userId);

            return {
                ...user,
                programming_languages: languages || [],
                topics: topics || []
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    /**
     * Get available projects for recommendation
     */
    async getAvailableProjects() {
        try {
            const { data: projects, error } = await supabase
                .from('projects')
                .select(`
                    id,
                    title,
                    description,
                    difficulty_level,
                    required_experience_level,
                    current_members,
                    maximum_members,
                    status,
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
                .eq('status', 'recruiting')
                .lt('current_members', supabase.raw('maximum_members'));

            if (error) {
                throw error;
            }

            // Transform the data to make it easier to work with
            return projects.map(project => ({
                ...project,
                languages: project.project_languages?.map(pl => pl.programming_languages?.name) || [],
                topics: project.project_topics?.map(pt => pt.topics?.name) || []
            }));
        } catch (error) {
            console.error('Error getting available projects:', error);
            throw error;
        }
    }

    /**
     * Calculate match score between user and project
     */
    async calculateMatchScore(user, project) {
        const topicScore = this.calculateTopicMatch(user, project);
        const experienceScore = this.calculateExperienceMatch(user, project);
        const languageScore = this.calculateLanguageMatch(user, project);
        
        const totalScore = (
            topicScore * this.weights.topic_match +
            experienceScore * this.weights.experience_match +
            languageScore * this.weights.language_match
        );
        
        return Math.round(totalScore);
    }

    /**
     * Calculate topic matching score
     */
    calculateTopicMatch(user, project) {
        const userTopics = user.topics || [];
        const projectTopics = project.project_topics || [];

        if (userTopics.length === 0 || projectTopics.length === 0) {
            return 0;
        }

        let totalScore = 0;
        let matchCount = 0;

        for (const projectTopic of projectTopics) {
            const topicName = projectTopic.topics?.name;
            const userTopic = userTopics.find(ut => 
                ut.topics?.name === topicName
            );
            
            if (userTopic) {
                let score = this.getInterestScore(userTopic.interest_level);
                score += this.getExperienceScore(userTopic.experience_level);
                
                // Boost score for primary project topics
                if (projectTopic.is_primary) {
                    score *= 1.5;
                }
                
                totalScore += score;
                matchCount++;
            }
        }

        return matchCount > 0 ? (totalScore / matchCount) : 0;
    }

    /**
     * Calculate experience level matching
     */
    calculateExperienceMatch(user, project) {
        const userExp = user.years_experience || 0;
        const requiredLevel = project.required_experience_level;
        
        const levelRanges = {
            'beginner': [0, 2],
            'intermediate': [2, 5],
            'advanced': [5, 10],
            'expert': [10, 100]
        };
        
        const [minReq, maxReq] = levelRanges[requiredLevel] || [0, 100];
        
        if (userExp >= minReq && userExp <= maxReq) {
            return 100; // Perfect match
        } else if (userExp < minReq) {
            // User is underqualified
            const gap = minReq - userExp;
            return Math.max(0, 100 - (gap * 20));
        } else {
            // User is overqualified (still good but slightly lower score)
            return 80;
        }
    }

    /**
     * Calculate programming language matching
     */
    calculateLanguageMatch(user, project) {
        const userLanguages = user.programming_languages || [];
        const projectLanguages = project.project_languages || [];

        if (userLanguages.length === 0 || projectLanguages.length === 0) {
            return 0;
        }

        let totalScore = 0;
        let matchCount = 0;

        for (const projectLang of projectLanguages) {
            const langName = projectLang.programming_languages?.name;
            const userLang = userLanguages.find(ul => 
                ul.programming_languages?.name === langName
            );
            
            if (userLang) {
                const score = this.compareProficiencyLevels(
                    userLang.proficiency_level, 
                    projectLang.required_level
                );
                
                // Boost score for primary languages
                const finalScore = projectLang.is_primary ? score * 1.3 : score;
                totalScore += finalScore;
                matchCount++;
            }
        }

        return matchCount > 0 ? Math.min(100, totalScore / matchCount) : 0;
    }

    /**
     * Get match factors for explanation
     */
    async getMatchFactors(user, project) {
        return {
            topicMatch: this.calculateTopicMatch(user, project),
            experienceMatch: this.calculateExperienceMatch(user, project),
            languageMatch: this.calculateLanguageMatch(user, project),
            matchedTopics: this.getMatchedTopics(user, project),
            matchedLanguages: this.getMatchedLanguages(user, project)
        };
    }

    /**
     * Get matched topics between user and project
     */
    getMatchedTopics(user, project) {
        const userTopics = user.topics || [];
        const projectTopics = project.project_topics || [];
        
        const matches = [];
        for (const projectTopic of projectTopics) {
            const topicName = projectTopic.topics?.name;
            const userTopic = userTopics.find(ut => ut.topics?.name === topicName);
            if (userTopic) {
                matches.push({
                    name: topicName,
                    userInterest: userTopic.interest_level,
                    isPrimary: projectTopic.is_primary
                });
            }
        }
        return matches;
    }

    /**
     * Get matched languages between user and project
     */
    getMatchedLanguages(user, project) {
        const userLanguages = user.programming_languages || [];
        const projectLanguages = project.project_languages || [];
        
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

    /**
     * Store recommendations in database
     */
    async storeRecommendations(userId, recommendations) {
        try {
            // First, delete old recommendations for this user
            await supabase
                .from('project_recommendations')
                .delete()
                .eq('user_id', userId);

            // Insert new recommendations
            if (recommendations.length > 0) {
                const recommendationData = recommendations.map(rec => ({
                    user_id: userId,
                    project_id: rec.projectId,
                    recommendation_score: rec.score,
                    match_factors: rec.matchFactors,
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

    /**
     * Helper methods for scoring
     */
    getInterestScore(level) {
        const scores = { 'low': 30, 'medium': 60, 'high': 90 };
        return scores[level] || 0;
    }

    getExperienceScore(level) {
        const scores = { 'beginner': 25, 'intermediate': 50, 'advanced': 75, 'expert': 100 };
        return scores[level] || 0;
    }

    compareProficiencyLevels(userLevel, requiredLevel) {
        const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        const userScore = levels[userLevel] || 0;
        const requiredScore = levels[requiredLevel] || 0;
        
        if (userScore >= requiredScore) {
            return 100;
        } else {
            return Math.max(0, 100 - ((requiredScore - userScore) * 30));
        }
    }

    /**
     * Intelligent exam assessment (placeholder for now)
     */
    async assessCodingSkill(userId, projectId, submittedCode, challengeId) {
        // For now, return a mock response
        // You can implement the full logic later
        return {
            passed: false,
            score: 65,
            attemptId: `attempt_${Date.now()}`,
            failureCount: 1,
            needsLearning: false
        };
    }
}

module.exports = new SkillMatchingService();