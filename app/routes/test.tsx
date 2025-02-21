import UnderConstruction from './UnderConstruction.jsx';
import type { Route } from './+types/home';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../@/components/ui/card';
import { Label } from '../../@/components/ui/label';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Testing' },
    { name: 'description', content: 'Welcome to Your E-commerce Shop' },
  ];
}
export default function Test() {
  return (
    <>
      {/* <UnderConstruction pagename="Test" /> */}
      <Label htmlFor="email">Your email address</Label>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </>
  );
}
