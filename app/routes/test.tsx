import UnderConstruction from '../components/UnderConstruction.js';
// import type { Route } from './+types/home';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../@/components/ui/card';
import { Label } from '../../@/components/ui/label';

import dotenv from 'dotenv';
import { env } from 'process';
import { ImportProducts } from '../utils/ImportProducts.js';

// export function meta({}: Route.MetaArgs) {
//   return [
//     { title: 'Testing' },
//     { name: 'description', content: 'Welcome to Your E-commerce Shop' },
//   ];
// }
export default function Test() {
  // dotenv.config();
  // console.log(env.REACT_APP_BASEROW_API_URL);
  // console.log(env.REACT_APP_BASEROW_API_TOKEN);

  return (
    <>
      {/* <UnderConstruction pagename="Test" /> */}
      {/* <Label htmlFor="email">Your email address</Label>
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
      </Card> */}
      {/* {import.meta.env.REACT_APP_BASEROW_API_URL}
      {import.meta.env.REACT_APP_BASEROW_API_TOKEN} */}
      {/* <ImportProducts /> */}
      <div>hello</div>
    </>
  );
}
