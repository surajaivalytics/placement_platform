# MCQ Generator - Quota Error Fix Guide

## Problem
You encountered a **Gemini API Quota Exceeded** error (429 Too Many Requests). This happens when you've exceeded the free tier limits of Google's Generative AI API.

## ✅ Solution Applied

I've implemented the following fixes:

### 1. **Enhanced Error Handling**
- Better error messages that clearly explain the quota issue
- Longer toast duration (10 seconds) for quota errors
- Actionable guidance in error messages

### 2. **MOCK_AI Mode Enabled**
I've added `MOCK_AI=true` to your `.env` file. This enables a mock mode that:
- Bypasses the Gemini API completely
- Generates sample MCQ data for testing
- Allows you to continue development without API quota concerns

### 3. **Improved Error Detection**
The system now automatically detects quota/rate limit errors and provides helpful guidance.

## 🔄 Next Steps

**IMPORTANT:** You need to restart your development server for the changes to take effect:

1. Stop the current server (Ctrl+C in the terminal)
2. Restart with: `npm run dev`
3. Try generating MCQs again - you should now see mock data

## 🎯 Testing the Fix

After restarting:
1. Go to the MCQ Generator page
2. Enter some content or upload a file
3. Click "Generate Questions"
4. You should see mock questions generated instantly without API calls

## 🔧 Future Options

### Option 1: Wait for Quota Reset
- Free tier quotas typically reset daily
- Check your quota status at: https://ai.dev/rate-limit

### Option 2: Upgrade API Plan
- Visit: https://ai.google.dev/gemini-api/docs/rate-limits
- Consider upgrading if you need higher limits

### Option 3: Keep Using Mock Mode
- Perfect for development and testing
- No API costs
- Instant results
- To disable later, change `MOCK_AI=true` to `MOCK_AI=false` in `.env`

## 📝 Mock Data Format

The mock mode generates realistic sample data with:
- Customizable number of questions
- Proper difficulty levels
- Bloom's taxonomy levels
- Multiple choice options (A, B, C, D)
- Reference excerpts
- Correct answer highlighting

## 🚨 Remember

Always restart your Next.js server after modifying `.env` files!
