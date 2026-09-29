'use client';

import { useActionState } from 'react';
import { submitWork } from '@/app/actions';

export function SubmitForm({ taskId, current }: { taskId: string; current?: { link: string; note: string } }) {
  const [state, action, pending] = useActionState(submitWork.bind(null, taskId), null);
  return (
    <form action={action} className="submit-form">
      <label>
        Ссылка на работу
        <input name="link" type="url" required placeholder="https://figma.com/…" defaultValue={current?.link} />
      </label>
      <label>
        Комментарий для ментора
        <textarea name="note" rows={2} placeholder="Что было непонятно, где искал информацию" defaultValue={current?.note} />
      </label>
      <div className="row">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Отправляю…' : current ? 'Отправить заново' : 'Сдать на проверку'}
        </button>
        {state?.ok && <span className="note-ok">Отправлено</span>}
        {state?.error && <span className="note-err">{state.error}</span>}
      </div>
    </form>
  );
}
