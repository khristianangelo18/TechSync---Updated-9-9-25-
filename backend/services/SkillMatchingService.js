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
            const availableProjects = await this.getAvailableProjects(userId); // Pass userId here
            
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
     * FIXED: Removed supabase.raw() which doesn't exist
     * FIXED: Exclude user's own projects and projects they're already members of
     */
    async getAvailableProjects(userId) {
        try {
            // First get all recruiting projects with owner info
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
                    owner_id,
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

            // Get projects the user is already a member of
            const { data: userMemberships, error: membershipError } = await supabase
                .from('project_members')
                .select('project_id')
                .eq('user_id', userId)
                .eq('status', 'active');

            if (membershipError) {
                console.error('Error fetching user memberships:', membershipError);
            }

            const userProjectIds = new Set(userMemberships?.map(m => m.project_id) || []);

            // Filter projects where:
            // 1. current_members < maximum_members (has space)
            // 2. user is not the owner
            // 3. user is not already a member
            const availableProjects = projects.filter(project => 
                project.current_members < project.maximum_members &&
                project.owner_id !== userId &&
                !userProjectIds.has(project.id)
            );

            // Transform the data to make it easier to work with
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

    /**
     * Calculate match score between user and project
     */
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

    /**
     * Calculate topic match score
     */
    calculateTopicMatch(userTopics, projectTopics) {
        if (!userTopics?.length || !projectTopics?.length) return 0;

        const userTopicNames = userTopics.map(t => t.topics?.name).filter(Boolean);
        const projectTopicNames = projectTopics.map(t => t.topics?.name).filter(Boolean);

        const matches = userTopicNames.filter(topic => projectTopicNames.includes(topic));
        return (matches.length / projectTopicNames.length) * 100;
    }

    /**
     * Calculate experience match score
     */
    calculateExperienceMatch(userExperience, requiredExperience) {
        if (!userExperience || !requiredExperience) return 50; // neutral score

        const experienceLevels = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        };

        const userLevel = experienceLevels[userExperience] || 1;
        const requiredLevel = experienceLevels[requiredExperience] || 1;

        if (userLevel >= requiredLevel) {
            return 100; // Perfect match or overqualified
        } else {
            return Math.max(0, 100 - ((requiredLevel - userLevel) * 25));
        }
    }

    /**
     * Calculate programming language match score
     */
    calculateLanguageMatch(userLanguages, projectLanguages) {
        if (!userLanguages?.length || !projectLanguages?.length) return 0;

        const userLangNames = userLanguages.map(l => l.programming_languages?.name).filter(Boolean);
        const projectLangNames = projectLanguages.map(l => l.programming_languages?.name).filter(Boolean);

        const matches = userLangNames.filter(lang => projectLangNames.includes(lang));
        return (matches.length / projectLangNames.length) * 100;
    }

    /**
     * Get detailed match factors for explanation
     */
    async getMatchFactors(user, project) {
        const topicMatches = this.getTopicMatches(user.topics, project.project_topics);
        const languageMatches = this.getLanguageMatches(user.programming_languages, project.project_languages);
        
        return {
            topicMatches,
            languageMatches,
            experienceMatch: {
                userExperience: user.years_experience,
                requiredExperience: project.required_experience_level,
                isMatch: this.calculateExperienceMatch(user.years_experience, project.required_experience_level) >= 75
            }
        };
    }

    /**
     * Get topic matches for detailed explanation
     */
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

    /**
     * Get language matches for detailed explanation
     */
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
            // Don't throw here as this is not critical for the recommendation process
        }
    }

    /**
     * Assess coding skill through challenge
     */
    async assessCodingSkill(userId, projectId, submittedCode, challengeId) {
        try {
            // Get the challenge details
            const { data: challenge, error: challengeError } = await supabase
                .from('coding_challenges')
                .select('*')
                .eq('id', challengeId)
                .single();

            if (challengeError || !challenge) {
                throw new Error('Challenge not found');
            }

            // Simple code assessment (you can make this more sophisticated)
            const score = this.evaluateCode(submittedCode, challenge);
            
            // Store the attempt
            const { error: attemptError } = await supabase
                .from('coding_attempts')
                .insert({
                    user_id: userId,
                    project_id: projectId,
                    challenge_id: challengeId,
                    submitted_code: submittedCode,
                    score: score,
                    passed: score >= this.minPassingScore,
                    attempted_at: new Date().toISOString()
                });

            if (attemptError) {
                throw attemptError;
            }

            return {
                score,
                passed: score >= this.minPassingScore,
                feedback: this.generateFeedback(score, challenge),
                nextSteps: score >= this.minPassingScore ? 
                    'Congratulations! You can now apply to this project.' : 
                    'Keep practicing and try again when ready.'
            };

        } catch (error) {
            console.error('Error in assessCodingSkill:', error);
            throw error;
        }
    }

    /**
     * Simple code evaluation (placeholder - implement actual logic)
     */
    evaluateCode(code, challenge) {
        // This is a simplified evaluation
        // In a real system, you'd want to:
        // 1. Run the code against test cases
        // 2. Check for syntax errors
        // 3. Evaluate code quality, efficiency, etc.
        
        let score = 0;
        
        // Basic checks
        if (code && code.length > 10) score += 20;
        if (code.includes('function') || code.includes('def') || code.includes('=>')) score += 20;
        if (code.includes('return')) score += 20;
        if (code.split('\n').length > 3) score += 20; // Multi-line solution
        if (code.includes('if') || code.includes('for') || code.includes('while')) score += 20;
        
        return Math.min(score, 100);
    }

    /**
     * Generate feedback based on score
     */
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
}

module.exports = new SkillMatchingService();