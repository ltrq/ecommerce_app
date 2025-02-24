import type { Route } from './+types/home';
import HomePage from './HomePage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Your E-commerce Shop' },
    { name: 'description', content: 'Welcome to Your E-commerce Shop' },
  ];
}

export default function Home() {
  return (
    <>
      <HomePage />
    </>
  );
}
