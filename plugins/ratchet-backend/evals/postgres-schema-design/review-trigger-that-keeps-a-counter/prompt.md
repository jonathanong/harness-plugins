---
description: Reviewing a migration that keeps a per-project task count current with a trigger, asks for a count at read time first, not a repaired trigger
tags: [postgres-schema-design, skill-fired, schema]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Can you review this migration before I merge it? The project list shows how many open tasks
each project has, and counting them per project on every page load got slow. A project has
anywhere from zero to a few thousand open tasks. PostgreSQL 18.

```sql
ALTER TABLE projects ADD COLUMN open_task_count integer NOT NULL DEFAULT 0;
COMMENT ON COLUMN projects.open_task_count IS 'Open tasks in the project, kept by trigger.';

UPDATE projects p
SET open_task_count = (
  SELECT count(*) FROM tasks t WHERE t.project_id = p.id AND t.closed_at IS NULL
);

CREATE FUNCTION fn_tasks_sync_open_task_count() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.closed_at IS NULL THEN
    UPDATE projects SET open_task_count = open_task_count - 1 WHERE id = OLD.project_id;
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.closed_at IS NULL THEN
    UPDATE projects SET open_task_count = open_task_count + 1 WHERE id = NEW.project_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER tg_tasks_sync_open_task_count
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION fn_tasks_sync_open_task_count();
```

Reply with your review. Don't edit any files.
