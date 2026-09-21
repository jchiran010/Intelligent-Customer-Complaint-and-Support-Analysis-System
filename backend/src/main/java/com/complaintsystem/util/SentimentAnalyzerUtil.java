package com.complaintsystem.util;

import java.util.*;

public class SentimentAnalyzerUtil {

    private static final Set<String> VERY_NEGATIVE_WORDS = new HashSet<>(Arrays.asList(
            "fraud", "stolen", "scam", "illegal", "lawyer", "sue", "unauthorized", 
            "horrible", "disaster", "danger", "worst", "unacceptable", "furious", 
            "cheated", "lawsuit", "criminal", "stole", "breach"
    ));

    private static final Set<String> NEGATIVE_WORDS = new HashSet<>(Arrays.asList(
            "broken", "damaged", "error", "fail", "failed", "bug", "crash", "delayed", 
            "late", "missing", "poor", "bad", "slow", "annoying", "disappointed", 
            "terrible", "wrong", "defective", "refund", "cannot", "unable", "complaint",
            "overcharged", "double", "glitch", "loss", "lost", "issue", "problem"
    ));

    private static final Set<String> POSITIVE_WORDS = new HashSet<>(Arrays.asList(
            "thanks", "thank", "good", "great", "appreciate", "helpful", "resolved", 
            "excellent", "wonderful", "satisfied", "prompt", "solved", "best", "kind"
    ));

    private static final Set<String> CRITICAL_INDICATORS = new HashSet<>(Arrays.asList(
            "immediately", "urgent", "critical", "emergency", "asap", "security", 
            "unauthorized", "locked out", "loss of business", "production down", 
            "lawsuit", "police", "breach"
    ));

    public static class AnalysisResult {
        private final String sentiment;
        private final double score;
        private final String recommendedPriority;

        public AnalysisResult(String sentiment, double score, String recommendedPriority) {
            this.sentiment = sentiment;
            this.score = score;
            this.recommendedPriority = recommendedPriority;
        }

        public String getSentiment() { return sentiment; }
        public double getScore() { return score; }
        public String getRecommendedPriority() { return recommendedPriority; }
    }

    public static AnalysisResult analyze(String title, String description) {
        String text = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();
        String[] tokens = text.split("[^a-zA-Z0-9_]+");

        int veryNegativeCount = 0;
        int negativeCount = 0;
        int positiveCount = 0;
        int criticalCount = 0;

        for (String token : tokens) {
            if (VERY_NEGATIVE_WORDS.contains(token)) {
                veryNegativeCount++;
            } else if (NEGATIVE_WORDS.contains(token)) {
                negativeCount++;
            } else if (POSITIVE_WORDS.contains(token)) {
                positiveCount++;
            }

            if (CRITICAL_INDICATORS.contains(token)) {
                criticalCount++;
            }
        }

        // Check for multi-word phrases
        for (String phrase : CRITICAL_INDICATORS) {
            if (phrase.contains(" ") && text.contains(phrase)) {
                criticalCount += 2;
            }
        }

        // Calculate score (-1.0 to +1.0)
        double score = 0.0;
        int totalTokens = Math.max(tokens.length, 1);
        double rawDelta = (positiveCount * 1.0) - (negativeCount * 1.0) - (veryNegativeCount * 2.0);
        score = Math.max(-1.0, Math.min(1.0, rawDelta / Math.sqrt(totalTokens + 1)));

        String sentiment;
        if (veryNegativeCount > 0 || score <= -0.5) {
            sentiment = "VERY_NEGATIVE";
        } else if (score < -0.1) {
            sentiment = "NEGATIVE";
        } else if (score > 0.2) {
            sentiment = "POSITIVE";
        } else {
            sentiment = "NEUTRAL";
        }

        // Determine recommended priority
        String priority;
        if (criticalCount > 0 || veryNegativeCount >= 2) {
            priority = "CRITICAL";
        } else if (veryNegativeCount > 0 || negativeCount >= 2 || score <= -0.4) {
            priority = "HIGH";
        } else if (negativeCount > 0 || score < 0) {
            priority = "MEDIUM";
        } else {
            priority = "LOW";
        }

        return new AnalysisResult(sentiment, Math.round(score * 100.0) / 100.0, priority);
    }
}
