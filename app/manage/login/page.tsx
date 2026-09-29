import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="login-page">
      <h1>Вход для ментора</h1>
      <p className="muted">Здесь выставляются оценки и комментарии. Ученику этот раздел не нужен.</p>
      <LoginForm />
    </div>
  );
}
