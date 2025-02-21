import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from '@react-router/dev/routes';

export default [
  layout('routes/navbar.tsx', [
    route('sign-in', 'routes/sign-in.tsx'),
    route('sign-up', 'routes/sign-up.tsx'),

    route('product/:id', 'routes/product.tsx'),
    // ...prefix('product', [route(':id', 'routes/product.tsx')]),

    route('test', 'routes/test.tsx'),

    route('*', 'routes/e404.tsx'),
    layout('routes/Footer.tsx', [
      index('routes/home.tsx'),
      route('deals', 'routes/deals.tsx'),
      route('new-arrivals', 'routes/new-arrivals.tsx'),
      route('packages', 'routes/packages.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
