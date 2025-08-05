// services/SkillMatchingService.js
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
                        matchFactors: await this.getMatchFactors(user, project)
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
     * Calculate match score between user and project
     */
    async calculateMatchScore(user, project) {
        const topicScore = await this.calculateTopicMatch(user, project);
        const experienceScore = this.calculateExperienceMatch(user, project);
        const languageScore = await this.calculateLanguageMatch(user, project);
        
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
    async calculateTopicMatch(user, project) {
        const userTopics = await db.query(`
            SELECT ut.topic_id, ut.interest_level, ut.experience_level, t.name
            FROM user_topics ut
            JOIN topics t ON ut.topic_id = t.id
            WHERE ut.user_id = $1
        `, [user.id]);

        const projectTopics = await db.query(`
            SELECT pt.topic_id, pt.is_primary, t.name
            FROM project_topics pt
            JOIN topics t ON pt.topic_id = t.id
            WHERE pt.project_id = $1
        `, [project.id]);

        if (userTopics.rows.length === 0 || projectTopics.rows.length === 0) {
            return 0;
        }

        let totalScore = 0;
        let matchCount = 0;

        for (const projectTopic of projectTopics.rows) {
            const userTopic = userTopics.rows.find(ut => ut.topic_id === projectTopic.topic_id);
            
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
    async calculateLanguageMatch(user, project) {
        const userLanguages = await db.query(`
            SELECT upl.language_id, upl.proficiency_level, upl.years_experience, pl.name
            FROM user_programming_languages upl
            JOIN programming_languages pl ON upl.language_id = pl.id
            WHERE upl.user_id = $1
        `, [user.id]);

        const projectLanguages = await db.query(`
            SELECT pl.language_id, pl.required_level, pl.is_primary, proglang.name
            FROM project_languages pl
            JOIN programming_languages proglang ON pl.language_id = proglang.id
            WHERE pl.project_id = $1
        `, [project.id]);

        if (userLanguages.rows.length === 0 || projectLanguages.rows.length === 0) {
            return 0;
        }

        let totalScore = 0;
        let matchCount = 0;

        for (const projectLang of projectLanguages.rows) {
            const userLang = userLanguages.rows.find(ul => ul.language_id === projectLang.language_id);
            
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
     * Intelligent exam assessment
     */
    async assessCodingSkill(userId, projectId, submittedCode, challengeId) {
        try {
            // Get challenge details
            const challenge = await this.getChallengeDetails(challengeId);
            
            // Run code execution and testing
            const executionResult = await this.executeCode(submittedCode, challenge);
            
            // Calculate comprehensive score
            const score = await this.calculateComprehensiveScore(
                executionResult, 
                submittedCode, 
                challenge
            );
            
            // Store attempt
            const attemptId = await this.storeAttempt(userId, projectId, challengeId, {
                submitted_code: submittedCode,
                score: score.total,
                execution_time_ms: executionResult.executionTime,
                memory_usage_mb: executionResult.memoryUsage,
                test_cases_passed: executionResult.testCasesPassed,
                total_test_cases: executionResult.totalTestCases,
                code_quality_score: score.codeQuality,
                status: score.total >= this.minPassingScore ? 'passed' : 'failed'
            });
            
            // Check if user passed
            if (score.total >= this.minPassingScore) {
                await this.autoJoinProject(userId, projectId);
                return { passed: true, score: score.total, attemptId };
            }
            
            // Check failure count and recommend learning if needed
            const failureCount = await this.getFailureCount(userId, projectId);
            if (failureCount >= this.maxAttempts) {
                await this.generateLearningRecommendations(userId, challenge, score);
            }
            
            return { 
                passed: false, 
                score: score.total, 
                attemptId,
                failureCount,
                needsLearning: failureCount >= this.maxAttempts
            };
            
        } catch (error) {
            console.error('Error in assessCodingSkill:', error);
            throw error;
        }
    }

    /**
     * Execute submitted code against test cases
     */
    async executeCode(code, challenge) {
        // This would integrate with a code execution service like Judge0 or similar
        // For now, this is a placeholder
        const startTime = Date.now();
        
        try {
            // Mock execution - replace with actual code execution service
            const result = await this.mockCodeExecution(code, challenge.test_cases);
            
            return {
                success: true,
                testCasesPassed: result.passed,
                totalTestCases: result.total,
                executionTime: Date.now() - startTime,
                memoryUsage: result.memoryUsage || 10,
                output: result.output,
                errors: result.errors
            };
        } catch (error) {
            return {
                success: false,
                testCasesPassed: 0,
                totalTestCases: challenge.test_cases.length,
                executionTime: Date.now() - startTime,
                memoryUsage: 0,
                output: '',
                errors: error.message
            };
        }
    }

    /**
     * Calculate comprehensive score including code quality
     */
    async calculateComprehensiveScore(executionResult, code, challenge) {
        // Test case score (60% weight)
        const testScore = (executionResult.testCasesPassed / executionResult.totalTestCases) * 100;
        
        // Code quality score (25% weight)
        const codeQualityScore = await this.analyzeCodeQuality(code, challenge.programming_language_id);
        
        // Performance score (15% weight)
        const performanceScore = this.calculatePerformanceScore(
            executionResult.executionTime, 
            executionResult.memoryUsage,
            challenge.time_limit_minutes * 60 * 1000 // Convert to ms
        );
        
        const totalScore = Math.round(
            (testScore * 0.6) + 
            (codeQualityScore * 0.25) + 
            (performanceScore * 0.15)
        );
        
        return {
            total: totalScore,
            testCases: testScore,
            codeQuality: codeQualityScore,
            performance: performanceScore
        };
    }

    /**
     * Analyze code quality
     */
    async analyzeCodeQuality(code, languageId) {
        // This would integrate with code analysis tools like ESLint, SonarQube, etc.
        // For now, basic heuristics
        
        let score = 100;
        
        // Check code length (not too short, not too long)
        if (code.length < 50) score -= 20;
        if (code.length > 2000) score -= 10;
        
        // Check for comments
        const commentCount = (code.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
        if (commentCount === 0) score -= 10;
        
        // Check for proper variable naming (basic)
        const badVariableNames = code.match(/\b[a-z]\b/g) || [];
        score -= Math.min(15, badVariableNames.length * 3);
        
        // Check for code structure
        const functionCount = (code.match(/function\s+\w+|=>\s*{|\w+\s*:\s*function/g) || []).length;
        if (functionCount === 0 && code.length > 100) score -= 15;
        
        return Math.max(0, score);
    }

    /**
     * Generate learning recommendations after failures
     */
    async generateLearningRecommendations(userId, challenge, scoreBreakdown) {
        const language = await this.getLanguageById(challenge.programming_language_id);
        const project = await this.getProjectById(challenge.project_id);
        
        const recommendations = [];
        
        // If test cases failed, recommend algorithm/problem-solving tutorials
        if (scoreBreakdown.testCases < 50) {
            recommendations.push({
                type: 'algorithm',
                title: `${language.name} Algorithm Fundamentals`,
                url: this.getTutorialUrl('algorithm', language.name, 'beginner'),
                difficulty_level: 'beginner',
                reason: 'Low test case success rate'
            });
        }
        
        // If code quality is poor, recommend best practices
        if (scoreBreakdown.codeQuality < 60) {
            recommendations.push({
                type: 'best_practices',
                title: `${language.name} Best Practices and Code Quality`,
                url: this.getTutorialUrl('best_practices', language.name, 'intermediate'),
                difficulty_level: 'intermediate',
                reason: 'Code quality needs improvement'
            });
        }
        
        // If performance is poor, recommend optimization tutorials
        if (scoreBreakdown.performance < 50) {
            recommendations.push({
                type: 'performance',
                title: `${language.name} Performance Optimization`,
                url: this.getTutorialUrl('performance', language.name, 'advanced'),
                difficulty_level: 'advanced',
                reason: 'Performance optimization needed'
            });
        }
        
        // Store recommendations
        for (const rec of recommendations) {
            await db.query(`
                INSERT INTO learning_recommendations 
                (user_id, language_id, tutorial_url, tutorial_title, difficulty_level)
                VALUES ($1, $2, $3, $4, $5)
            `, [userId, challenge.programming_language_id, rec.url, rec.title, rec.difficulty_level]);
        }
        
        return recommendations;
    }

    // Helper methods
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
}

module.exports = new SkillMatchingService();