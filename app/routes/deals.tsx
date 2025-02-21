import type { Route } from './+types/home';
import UnderConstruction from './UnderConstruction.jsx';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Our Deals' },
    { name: 'description', content: 'Welcome to Your E-commerce Shop' },
  ];
}
export default function Deals() {
  return (
    <>
      <UnderConstruction pagename="Deals" />
    </>
  );
}
