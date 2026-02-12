# Bolt Food Sales Handover Automation - TODO

## Phase 1: Database Schema & Models
- [x] Design and implement database schema for call transcriptions
- [x] Design and implement database schema for merchant profiles
- [x] Design and implement database schema for contracts
- [x] Design and implement database schema for validations
- [x] Design and implement database schema for audits
- [x] Design and implement database schema for exceptions/logs
- [x] Add database helper functions for all tables

## Phase 2: File Upload & Storage System
- [x] Implement S3 storage integration for audio files
- [x] Implement S3 storage integration for PDF contracts
- [x] Implement S3 storage integration for transcription files
- [x] Create file upload UI component for audio files
- [x] Create file upload UI component for PDF contracts
- [x] Create file upload UI component for transcription text files
- [x] Add file validation (size, format, mime type)
- [x] Add progress indicators for file uploads

## Phase 3: AI Extraction & Transcription
- [x] Implement audio-to-text transcription using Whisper API
- [x] Implement AI extraction engine using LLM for structured data
- [x] Create extraction prompt templates for contract terms
- [x] Create extraction prompt templates for business context
- [x] Create extraction prompt templates for owner profile
- [x] Create extraction prompt templates for market intelligence
- [x] Implement confidence scoring for extracted fields
- [x] Add extraction result storage and audit trail

## Phase 4: Pre-Contract Validation System (Hard Gate)
- [ ] Implement mandatory fields validation logic
- [ ] Implement AI confidence threshold validation
- [ ] Create validation decision tree logic (DT-001)
- [ ] Implement Sales Ops routing for low confidence cases
- [ ] Implement Sales Manager override workflow
- [ ] Create validation report generation
- [ ] Add validation status tracking

## Phase 5: Contract Auditor System
- [ ] Implement PDF contract OCR and text extraction
- [ ] Implement contract term comparison logic
- [ ] Create discrepancy detection algorithm
- [ ] Implement severity assessment (High/Medium/Low)
- [ ] Create discrepancy report generation
- [ ] Implement routing logic based on severity (DT-002)
- [ ] Add audit trail for all comparisons

## Phase 6: Merchant Profile Management
- [ ] Create merchant profile creation workflow
- [ ] Implement profile versioning system
- [ ] Add profile summary generation
- [ ] Create profile access control logic
- [ ] Implement profile update tracking
- [ ] Add profile search and filtering

## Phase 7: Dashboard & UI
- [ ] Design and implement Account Manager dashboard
- [ ] Create merchant list view with status indicators
- [ ] Implement call transcription upload page
- [ ] Create audio upload and transcription page
- [ ] Create contract upload page
- [ ] Implement validation review interface
- [ ] Create audit results display page
- [ ] Add merchant profile detail view
- [ ] Implement notification center UI

## Phase 8: Admin Panel
- [ ] Create admin dashboard layout
- [ ] Implement validation rules configuration UI
- [ ] Add user management interface
- [ ] Create exception log viewer
- [ ] Implement workflow configuration panel
- [ ] Add system settings management

## Phase 9: Notifications & Alerts
- [ ] Implement owner notification system for new handovers
- [ ] Add notifications for high-severity discrepancies
- [ ] Create email notification templates
- [ ] Implement in-app notification system
- [ ] Add notification preferences management

## Phase 10: Testing & Documentation
- [ ] Write unit tests for database operations
- [ ] Write unit tests for AI extraction logic
- [ ] Write unit tests for validation logic
- [ ] Write unit tests for audit comparison logic
- [ ] Create user documentation
- [ ] Add inline code documentation

## Phase 11: GitHub Integration
- [ ] Create GitHub repository
- [ ] Push initial codebase to repository
- [ ] Configure repository settings
- [ ] Add README with project documentation
