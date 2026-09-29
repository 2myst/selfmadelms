import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="login-page">
      <h1>Страница не найдена</h1>
      <p><Link href="/">Вернуться к программе</Link></p>
    </div>
  );
}
