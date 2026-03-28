-- Create Template table
CREATE TABLE "Template" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "content" JSONB NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "ownerId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Add template seed data (public templates for all users)
-- Weekly Report template
INSERT INTO "Template" ("name", "content", "category", "isPublic", "ownerId") VALUES
('Weekly Report', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Weekly Report - Week of [DATE]"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"本周完成"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"任务1"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"下周计划"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"任务1"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"问题与阻塞"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"无"}]}]}]}]}', 'weekly_report', true, 1);

-- Meeting Notes template
INSERT INTO "Template" ("name", "content", "category", "isPublic", "ownerId") VALUES
('Meeting Notes', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Meeting: [TITLE]"}]},{"type":"paragraph","content":[{"type":"text","text":"Date: [DATE]"}]},{"type":"paragraph","content":[{"type":"text","text":"Attendees: "}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Agenda"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"议题1"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Discussion"}]},{"type":"paragraph","content":[{"type":"text","text":"..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Action Items"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"[ ] 任务 - @人 - due: 日期"}]}]}]}]}', 'meeting_notes', true, 1);

-- Retrospective template
INSERT INTO "Template" ("name", "content", "category", "isPublic", "ownerId") VALUES
('Sprint Retrospective', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Sprint [NUMBER] Retrospective"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"👍 What went well"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"👎 What could be improved"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"🤔 Action items for next sprint"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}]}]}', 'retro', true, 1);

-- PRD template
INSERT INTO "Template" ("name", "content", "category", "isPublic", "ownerId") VALUES
('PRD Template', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Product Requirements Document"}]},{"type":"paragraph","content":[{"type":"text","text":"Version: 1.0 | Author: [NAME] | Date: [DATE]"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Overview"}]},{"type":"paragraph","content":[{"type":"text","text":"..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Goals"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Goal 1"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"User Stories"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"As a [user], I want [feature] so that [benefit]"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Requirements"}]},{"type":"paragraph","content":[{"type":"text","text":"..."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Success Metrics"}]},{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}', 'prd', true, 1);
