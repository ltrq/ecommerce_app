import UnderConstruction from '../components/UnderConstruction.js';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Our New Arrivials' },
    { name: 'description', content: 'Welcome to Your E-commerce Shop' },
  ];
}

export default function NewArrivals() {
  return (
    <>
      <UnderConstruction pagename="New Arrivals" />
    </>
  );
}
