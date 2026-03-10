# Phase 11: Community Insight & Documentation

This phase has successfully enhanced the collaborative and reflective capabilities of the Nexus platform.

## Key Features

### 1. Markdown Export (Documentation)
Users can now convert their visual graphs into structured Markdown documentation. This is ideal for project reporting, meeting notes, or porting collaborative research to other platforms.
- **Export Trigger**: Located in the Graph Editor's top navigation bar ("Docs" button).
- **Structure**: Generates a hierarchical Markdown file with node types as headers, including labels, descriptions, and connection maps.

### 2. Community Activity Feed
The Dashboard now features a "Community Activity" stream, providing real-time insight into what's happening across the platform.
- **New Maps**: Highlights whenever a new public map is created.
- **Trending Nodes**: Surfaces nodes that are receiving significant community votes.
- **Timestamped**: Shows relative time for quick context.

### 3. Profile Achievements & Badges
User profiles now dynamically showcase achievements based on contribution level.
- **Explorer**: For newcomers just starting their journey.
- **Active Contributor**: Awarded for reaching 10 reputation.
- **Mapper**: Awarded for creating 3 or more maps.
- **Strategist**: Awarded for reaching 50 reputation.
- **Master Builder**: Awarded for creating 10 or more maps.

## Technical Implementation Details
- **Backend**: New activity polling routes implemented in `backend/routes/activity.js`.
- **Frontend**: Integrated `FileText` and `Download` from `lucide-react` for the export functionality.
- **Real-time**: Activity feed polls global data to ensure cross-user transparency.

---
*Nexus v2.1 - Empowering Communities through Visual Logic.*
