# Tamkeen (تمكين) - PRD

## Overview
Mobile-first Arabic (RTL) educational and employment platform built with Expo + FastAPI + MongoDB + Gemini 3.1 Pro. Bridges academia and the job market for 4 departments: Accounting, Computer Engineering, Computer Science, AI Sciences.

## Roles
- **Student**: register → competency test → if pass: jobs path; if fail: Tamkeen Academy (micro-learning + AI Mentor) → retry
- **Employer**: register → post jobs (with optional custom questions) → smart-ranked applicants

## Auth
- Email/password (JWT bcrypt) + Emergent Google Auth (`/api/auth/google/exchange`)
- Roles encoded in token; protected endpoints via `get_current_user` + `require_role`

## Key Features Implemented
- Competency test (8 questions sampled by dept/level), 60% pass threshold, auto-routes student
- Jobs: filtered by dept/level/gender preference, only visible to passed students
- Direct-accept or pending review on apply (employer config)
- Smart ranking of applicants (sorted by student_score desc)
- AI Mentor (Gemini 3.1 Pro) — multi-turn Arabic chat
- AI Mock Interview (Gemini, interview-tuned system prompt)
- Notifications for both sides (test result, new applicant, acceptance)
- Tamkeen Academy: micro-courses with lessons per department

## Stack
- Backend: FastAPI, Motor, bcrypt, PyJWT, emergentintegrations (Gemini 3.1 Pro)
- Frontend: Expo Router, AsyncStorage, expo-web-browser, @expo/vector-icons
- Theme: Cobalt blue (#0033CC) + Signal Orange (#FF5A36), RTL Arabic typography

## Test Accounts
See `/app/memory/test_credentials.md`
