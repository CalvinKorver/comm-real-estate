CSV Functionality Plan

Multi-Stage Import Process
Stage 1: Parse CSV and validate column mapping
Stage 2: Preview mapped data and show conflicts
Stage 3: Process owners (deduplication and creation)
Stage 4: Process properties (matching and merging)
Stage 5: Create contacts and handle phone conflicts
Stage 6: Geocode new properties
Conflict Resolution UI
Show potential duplicates before processing
Allow users to choose merge strategy
Provide manual override options
Show preview of what will be created/updated
Import Summary and Reporting
Detailed report of what was created/updated/skipped
List of conflicts that need manual review
Statistics on deduplication effectiveness
Export of import results
5. Technical Implementation
New Components to Create:
ColumnMappingModal: UI for mapping CSV columns to database fields
ImportPreviewModal: Show mapped data before import
ConflictResolutionModal: Handle duplicates and conflicts
ImportProgressModal: Show import progress and results
Enhanced Services:
Enhanced CSV Processor: Support dynamic column mapping
Property Matching Service: Intelligent property matching and merging
Enhanced Owner Deduplication: Phone number conflict resolution
Import Orchestrator: Coordinate the multi-stage import process
Database Enhancements:
Import Logs: Track import history and results
Column Mapping Templates: Store reusable mapping configurations
Conflict Resolution Records: Track how conflicts were resolved
6. User Experience Improvements
Drag-and-Drop Column Mapping: Visual interface for mapping columns
Template System: Save and reuse column mappings
Import Templates: Pre-configured import settings for different data sources
Batch Processing: Handle large files with progress indicators
Error Recovery: Resume failed imports from where they left off
Implementation Priority
Phase 1: Column mapping system and dynamic CSV processing
Phase 2: Enhanced property matching and merging
Phase 3: Phone number conflict resolution in owner deduplication
Phase 4: Advanced conflict resolution UI and reporting
Phase 5: Template system and user experience improvements
This plan addresses both of your requirements:
Data upload with column mapping: Dynamic column mapping system with UI
Property entity combination: Intelligent matching and merging with additive updates
Phone number conflict handling: Sophisticated deduplication that handles phone number conflicts