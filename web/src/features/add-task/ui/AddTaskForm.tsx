import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import type { NewTask, Priority } from "../../../entities/task/model/types";
import { PRIORITIES, PRIORITY_LABELS } from "../../../shared/config";
import { Button } from "../../../shared/ui/Button";

type AddTaskFormProps = {
  date: string;
  onAdd: (input: NewTask) => Promise<boolean>;
};

export function AddTaskForm({ date, onAdd }: AddTaskFormProps) {
  const [text, setText] = useState("");
  const [taskDate, setTaskDate] = useState(date);
  const [priority, setPriority] = useState<Priority>("medium");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTaskDate(date);
  }, [date]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;

    void onAdd({ text: value, date: taskDate || date, priority }).then((ok) => {
      if (ok) setText("");
      inputRef.current?.focus();
    });
  };

  return (
    <form autoComplete="off" onSubmit={submit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Что нужно сделать?"
        maxLength={200}
        required
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <input
        type="date"
        aria-label="Дата задачи"
        value={taskDate}
        onChange={(event) => setTaskDate(event.target.value)}
      />
      <select
        aria-label="Приоритет"
        value={priority}
        onChange={(event) => setPriority(event.target.value as Priority)}
      >
        {PRIORITIES.map((value) => (
          <option key={value} value={value}>
            {PRIORITY_LABELS[value]}
          </option>
        ))}
      </select>
      <Button type="submit">Добавить</Button>
    </form>
  );
}
