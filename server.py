#!/usr/bin/env python3
"""Трекер задач: статика + JSON API на стандартной библиотеке Python.

Запуск:  python server.py
Открыть: http://localhost:8000/
База:    tracker.db рядом со скриптом (создаётся автоматически).
"""

import datetime
import json
import os
import re
import sqlite3
import time
import uuid
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "tracker.db")
DIST_DIR = os.path.join(BASE_DIR, "web", "dist")
STATIC_DIR = DIST_DIR if os.path.isdir(DIST_DIR) else BASE_DIR
PORT = 8000
PRIORITIES = ("low", "medium", "high")
TASK_ID_RE = re.compile(r"^/api/tasks/([^/]+)$")
RESTORE_RE = re.compile(r"^/api/tasks/([^/]+)/restore$")


@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                date TEXT NOT NULL,
                priority TEXT NOT NULL,
                done INTEGER NOT NULL DEFAULT 0,
                moved INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date)")
        columns = [row["name"] for row in conn.execute("PRAGMA table_info(tasks)")]
        if "archived" not in columns:
            conn.execute("ALTER TABLE tasks ADD COLUMN archived INTEGER NOT NULL DEFAULT 0")


def valid_date(value):
    if not isinstance(value, str) or len(value) != 10:
        return False
    try:
        datetime.date.fromisoformat(value)
    except ValueError:
        return False
    return True


def next_day(value):
    return (datetime.date.fromisoformat(value) + datetime.timedelta(days=1)).isoformat()


def row_to_task(row):
    return {
        "id": row["id"],
        "text": row["text"],
        "date": row["date"],
        "priority": row["priority"],
        "done": bool(row["done"]),
        "moved": row["moved"],
        "archived": bool(row["archived"]),
        "created_at": row["created_at"],
    }


def fetch_task(task_id):
    with db() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return row_to_task(row) if row else None


class TrackerHandler(SimpleHTTPRequestHandler):
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map)
    extensions_map.update({
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript",
        ".png": "image/png",
    })

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def guess_type(self, path):
        normalized = path.replace("\\", "/")
        if normalized.endswith("/manifest.json"):
            return "application/manifest+json"
        return super().guess_type(path)

    # ---------- helpers ----------

    def send_json(self, code, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def send_error_json(self, code, message):
        self.send_json(code, {"error": message})

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except (TypeError, ValueError):
            length = 0
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        if not raw:
            return {}
        data = json.loads(raw.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValueError("JSON object expected")
        return data

    def log_message(self, fmt, *args):  # compact log line
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    # ---------- GET ----------

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/tasks":
            params = parse_qs(parsed.query)
            date = (params.get("date") or [""])[0]
            date_from = (params.get("from") or [""])[0]
            date_to = (params.get("to") or [""])[0]
            query = (params.get("q") or [""])[0].strip()

            if date:
                if not valid_date(date):
                    return self.send_error_json(400, "invalid date")
                date_from = date_to = date
            elif date_from or date_to:
                if not date_from or not date_to:
                    return self.send_error_json(400, "from and to are required")
                if not valid_date(date_from) or not valid_date(date_to):
                    return self.send_error_json(400, "invalid date")
                if date_from > date_to:
                    return self.send_error_json(400, "from is after to")

            sql = "SELECT * FROM tasks WHERE archived = 0"
            args = []
            if date_from:
                sql += " AND date >= ? AND date <= ?"
                args.extend([date_from, date_to])
            sql += " ORDER BY date ASC, done ASC, created_at ASC, rowid ASC"

            with db() as conn:
                rows = conn.execute(sql, tuple(args)).fetchall()

            result = [row_to_task(r) for r in rows]
            if query:
                needle = query.casefold()
                result = [t for t in result if needle in t["text"].casefold()]
            return self.send_json(200, result)
        if parsed.path == "/api/archive":
            with db() as conn:
                rows = conn.execute(
                    "SELECT * FROM tasks WHERE archived = 1 "
                    "ORDER BY date DESC, created_at ASC, rowid ASC"
                ).fetchall()
            return self.send_json(200, [row_to_task(r) for r in rows])
        if parsed.path.startswith("/api/"):
            return self.send_error_json(404, "not found")
        return super().do_GET()

    # ---------- POST ----------

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/tasks":
            try:
                payload = self.read_json()
            except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
                return self.send_error_json(400, "invalid JSON")

            text = payload.get("text")
            date = payload.get("date")
            priority = payload.get("priority", "medium")

            if not isinstance(text, str) or not text.strip():
                return self.send_error_json(400, "text is required")
            text = text.strip()
            if len(text) > 500:
                return self.send_error_json(400, "text is too long")
            if not valid_date(date):
                return self.send_error_json(400, "invalid date")
            if priority not in PRIORITIES:
                return self.send_error_json(400, "invalid priority")

            task = {
                "id": uuid.uuid4().hex,
                "text": text,
                "date": date,
                "priority": priority,
                "done": False,
                "moved": 0,
                "created_at": int(time.time() * 1000),
            }
            with db() as conn:
                conn.execute(
                    "INSERT INTO tasks (id, text, date, priority, done, moved, created_at) "
                    "VALUES (?, ?, ?, ?, 0, 0, ?)",
                    (task["id"], task["text"], task["date"], task["priority"], task["created_at"]),
                )
            return self.send_json(200, task)

        if parsed.path == "/api/tasks/move-unfinished":
            try:
                payload = self.read_json()
            except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
                return self.send_error_json(400, "invalid JSON")
            date = payload.get("date")
            if not valid_date(date):
                return self.send_error_json(400, "invalid date")
            target = next_day(date)
            with db() as conn:
                cursor = conn.execute(
                    "UPDATE tasks SET date = ?, moved = moved + 1 "
                    "WHERE date = ? AND done = 0",
                    (target, date),
                )
                moved = cursor.rowcount
            return self.send_json(200, {"moved": moved, "date": target})

        if parsed.path == "/api/tasks/archive-done":
            try:
                payload = self.read_json()
            except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
                return self.send_error_json(400, "invalid JSON")
            date = payload.get("date")
            if not valid_date(date):
                return self.send_error_json(400, "invalid date")
            with db() as conn:
                cursor = conn.execute(
                    "UPDATE tasks SET archived = 1 "
                    "WHERE date = ? AND done = 1 AND archived = 0",
                    (date,),
                )
                archived = cursor.rowcount
            return self.send_json(200, {"archived": archived, "date": date})

        match = RESTORE_RE.match(parsed.path)
        if match:
            task_id = unquote(match.group(1))
            with db() as conn:
                exists = conn.execute("SELECT 1 FROM tasks WHERE id = ?", (task_id,)).fetchone()
                if not exists:
                    return self.send_error_json(404, "task not found")
                conn.execute("UPDATE tasks SET archived = 0 WHERE id = ?", (task_id,))
            return self.send_json(200, fetch_task(task_id))

        return self.send_error_json(404, "not found")

    # ---------- PATCH ----------

    def do_PATCH(self):
        match = TASK_ID_RE.match(urlparse(self.path).path)
        if not match:
            return self.send_error_json(404, "not found")
        task_id = unquote(match.group(1))

        try:
            payload = self.read_json()
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
            return self.send_error_json(400, "invalid JSON")

        fields = {}
        if "text" in payload:
            text = payload["text"]
            if not isinstance(text, str) or not text.strip():
                return self.send_error_json(400, "text must be a non-empty string")
            if len(text.strip()) > 500:
                return self.send_error_json(400, "text is too long")
            fields["text"] = text.strip()
        if "done" in payload:
            done = payload["done"]
            if not isinstance(done, (bool, int)):
                return self.send_error_json(400, "done must be boolean")
            fields["done"] = 1 if done else 0
        if "date" in payload:
            if not valid_date(payload["date"]):
                return self.send_error_json(400, "invalid date")
            fields["date"] = payload["date"]
        if "priority" in payload:
            if payload["priority"] not in PRIORITIES:
                return self.send_error_json(400, "invalid priority")
            fields["priority"] = payload["priority"]

        if not fields:
            return self.send_error_json(400, "no fields to update")

        with db() as conn:
            exists = conn.execute("SELECT 1 FROM tasks WHERE id = ?", (task_id,)).fetchone()
            if not exists:
                return self.send_error_json(404, "task not found")
            assignments = ", ".join("%s = ?" % name for name in fields)
            conn.execute(
                "UPDATE tasks SET %s WHERE id = ?" % assignments,
                tuple(fields.values()) + (task_id,),
            )

        return self.send_json(200, fetch_task(task_id))

    # ---------- DELETE ----------

    def do_DELETE(self):
        match = TASK_ID_RE.match(urlparse(self.path).path)
        if not match:
            return self.send_error_json(404, "not found")
        task_id = unquote(match.group(1))
        with db() as conn:
            cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        if cursor.rowcount == 0:
            return self.send_error_json(404, "task not found")
        return self.send_json(200, {"ok": True, "id": task_id})


def main():
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), TrackerHandler)
    print("Трекер задач: http://localhost:%d/" % PORT)
    print("База: %s" % DB_PATH)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nОстановлено.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
