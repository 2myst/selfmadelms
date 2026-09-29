'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="login">
      <label>
        Пароль ментора
        <input name="password" type="password" required autoFocus autoComplete="current-password" />
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? 'Проверяю…' : 'Войти'}
      </button>
      {state?.error && <p className="note-err">{state.error}</p>}
    </form>
  );
}
