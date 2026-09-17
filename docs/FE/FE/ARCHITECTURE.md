# MyTracker — Frontend Architecture

**Status:** Active Development  
**Version:** 1.0  
**Last Updated:** 2026-09-02

---

## 1. Purpose

This document defines the frontend architecture for MyTracker.

The frontend is responsible for:

- User interface
- Navigation
- User interaction
- Client-side validation
- API integration
- Local UI state
- Server-state management
- Permission-aware presentation
- Context selection
- Loading/error/empty states

The frontend is **not** the security boundary.

All authorization and data isolation must be enforced by the backend.

---

## 2. Technology Stack

Current frontend stack:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- TanStack Table
- React Router
- React Hook Form
- Zod
- Radix UI
- Tiptap
- Recharts
- dnd-kit

Use the existing project stack unless there is an explicit architecture decision to change it.

---

## 3. Architecture Principles

### 3.1 API First

Business data must come through application API services.

```text
React
  ↓
Feature Hook / Query
  ↓
API Service
  ↓
MyTracker Backend
  ↓
Supabase