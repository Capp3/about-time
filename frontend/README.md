# About Time - Frontend

React 18 + TypeScript frontend for the About Time timekeeping and time-off management system.

## Overview

Single Page Application (SPA) built with React and TypeScript, providing a modern, responsive interface for employees and managers to manage time tracking and time-off requests.

## Technology Stack

- **React 18.3.1** - UI framework
- **TypeScript 5.4.5** - Type-safe JavaScript
- **Webpack 5.91.0** - Module bundler
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **React Router 7.9.0** - Client-side routing
- **Axios** - HTTP client
- **Sentry** - Error tracking

## Project Structure

```
frontend/
├── js/                       # TypeScript/React source code
│   ├── App.tsx              # Root component with routing & error boundary
│   ├── index.tsx            # Application entry point
│   ├── api/                 # Generated API client from OpenAPI
│   │   └── index.ts         # API client exports
│   ├── components/          # Reusable React components
│   │   ├── TopNav.tsx       # Navigation component
│   │   └── index.ts         # Component exports
│   ├── pages/               # Page components (route targets)
│   │   ├── Home.tsx         # Home/dashboard page
│   │   ├── Users.tsx        # Users listing page
│   │   └── __tests__/       # Page component tests
│   ├── routes/              # Route definitions
│   │   └── index.ts         # Router configuration
│   ├── loaders/             # React Router data loaders
│   │   ├── users.ts         # User data loader
│   │   └── index.ts         # Loader exports
│   ├── types/               # TypeScript type definitions
│   │   ├── index.d.ts       # Global type definitions
│   │   └── assets.d.ts      # Asset type declarations
│   ├── utils/               # Utility functions
│   │   ├── urls.ts          # URL utilities
│   │   ├── navigation.ts    # Navigation helpers
│   │   └── index.ts         # Utility exports
│   └── constants/           # Application constants
│       └── index.ts         # Constant exports
├── css/                     # Stylesheets
│   └── style.css            # Main stylesheet (Tailwind directives)
├── assets/                  # Static assets
│   └── images/              # Image files
│       └── index.d.ts       # Image type declarations
├── Dockerfile               # Frontend Docker container
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Key Features

### Current Implementation

- ✅ React 18 with TypeScript
- ✅ Client-side routing (React Router 7)
- ✅ Type-safe API client (generated from OpenAPI)
- ✅ CSRF token handling
- ✅ Error boundary with Sentry
- ✅ Component testing setup (Jest + React Testing Library)
- ✅ Tailwind CSS styling

### Planned Features

- Authentication UI (Login, Logout)
- Employee Dashboard
- Timeclock Entry Interface
- Time-Off Request Management
- Manager Dashboard
- Real-time Updates
- Responsive Mobile Design

## Development Setup

### Prerequisites

- Node.js 20.x
- PNPM 10.18.0+
- Backend API running (see `backend/README.md`)

### Installation

```bash
# Install dependencies
pnpm install
```

### Running Development Server

```bash
# Start dev server with hot reload
pnpm run dev

# Access at http://localhost:3000
```

### Building for Production

```bash
# TypeScript compilation + Webpack build
pnpm run build

# Output in dist/ directory
```

## Application Structure

### Entry Point (index.tsx)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/style.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Root Component (App.tsx)

```typescript
import * as Sentry from "@sentry/react";
import { RouterProvider } from "react-router/dom";
import { OpenAPI } from "./api";
import router from "./routes";

// Configure CSRF token injection
OpenAPI.interceptors.request.use((request) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (request.headers && csrftoken) {
    request.headers["X-CSRFTOKEN"] = csrftoken;
  }
  return request;
});

const App = () => (
  <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
    <RouterProvider router={router} />
  </Sentry.ErrorBoundary>
);
```

### Routing (routes/index.ts)

```typescript
import { createBrowserRouter } from "react-router";
import { usersLoader } from "@/js/loaders";
import Home from "@/js/pages/Home";
import Users from "@/js/pages/Users";

const router = createBrowserRouter([
  { index: true, Component: Home },
  { path: "users", Component: Users, loader: usersLoader },
]);

export default router;
```

## Component Patterns

### Functional Components with TypeScript

```typescript
import type { FC } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};
```

### Page Components with Loaders

```typescript
// pages/Users.tsx
import { useLoaderData } from 'react-router';
import type { User } from '@/js/types';

export const Users = () => {
  const { users } = useLoaderData() as { users: User[] };
  
  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
};

// loaders/users.ts
import { api } from '@/js/api';

export const usersLoader = async () => {
  const users = await api.users.list();
  return { users };
};
```

## API Client

### Generated Client Usage

The API client is automatically generated from the backend OpenAPI schema:

```bash
# Regenerate API client (backend must be running)
pnpm run openapi-ts
```

### Making API Calls

```typescript
import { api } from '@/js/api';

// List resources
const users = await api.users.list();

// Get specific resource
const user = await api.users.retrieve({ id: 1 });

// Create resource
const newUser = await api.users.create({
  email: 'user@example.com',
  password: 'password123',
});

// Update resource
const updated = await api.users.partialUpdate({
  id: 1,
  email: 'newemail@example.com',
});

// Delete resource
await api.users.destroy({ id: 1 });
```

### Error Handling

```typescript
try {
  await api.users.create(userData);
} catch (error) {
  if (error.response) {
    // Validation errors from server
    console.error('Validation errors:', error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network error:', error);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## State Management

### Local Component State

```typescript
const [count, setCount] = useState(0);
```

### Form State

```typescript
const [formData, setFormData] = useState({
  email: '',
  password: '',
});

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
```

### Server State (React Router Loaders)

```typescript
// Preferred approach for fetching server data
export const dataLoader = async () => {
  const data = await api.getData();
  return { data };
};

// In component
const { data } = useLoaderData() as { data: DataType };
```

## Styling

### Tailwind CSS

```typescript
// Using Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click Me
  </button>
</div>
```

### Custom Styles

```css
/* css/style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Update snapshots
pnpm test:update

# Generate coverage report
pnpm coverage
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Code Quality

### Linting

```bash
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

### Type Checking

```bash
# Type check without emitting files
pnpm tsc
```

## Build Configuration

### Webpack Configuration

See `webpack.config.js` in project root:
- Entry: `frontend/js/index.tsx`
- Output: `dist/`
- Development: Hot reload, source maps
- Production: Minification, optimization

### Environment Variables

Configure in webpack DefinePlugin:
- `process.env.NODE_ENV`
- API base URL
- Sentry DSN

## Authentication

### CSRF Token Handling

Automatically included in all API requests:

```typescript
// In App.tsx
OpenAPI.interceptors.request.use((request) => {
  const { csrftoken } = cookie.parse(document.cookie);
  if (request.headers && csrftoken) {
    request.headers["X-CSRFTOKEN"] = csrftoken;
  }
  return request;
});
```

### Session Management

- Session cookie managed by backend
- Include `credentials: 'include'` in fetch requests
- API client configured with `withCredentials: true`

## Error Tracking

### Sentry Integration

```typescript
import * as Sentry from "@sentry/react";

// Initialized in App.tsx
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error boundaries catch React errors
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</Sentry.ErrorBoundary>
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));

// In routes
{
  path: 'dashboard',
  element: (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  ),
}
```

### Memoization

```typescript
// Expensive calculations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Callback functions
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## Accessibility

- Use semantic HTML elements
- Include ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader testing

```typescript
<button
  onClick={handleClick}
  aria-label="Close modal"
  className="..."
>
  <CloseIcon aria-hidden="true" />
</button>
```

## Common Issues

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Restart TypeScript server in editor
```

### Hot Reload Not Working

```bash
# Restart dev server
pnpm run dev

# Clear Webpack cache
rm -rf node_modules/.cache/webpack
```

### API Client Out of Sync

```bash
# Ensure backend is running
# Regenerate API client
pnpm run openapi-ts
```

## Scripts Reference

```json
{
  "test": "jest",
  "test:watch": "pnpm test -- --watch",
  "test:update": "pnpm test -- --u",
  "dev": "webpack serve --mode=development --hot",
  "build": "NODE_ENV=production tsc && webpack --progress --bail --mode=production",
  "lint": "eslint frontend --fix",
  "tsc": "tsc -p ./tsconfig.json --noEmit",
  "coverage": "jest --coverage",
  "openapi-ts": "openapi-ts"
}
```

## References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/react)
- [Project Documentation](../docs/README.md)

## Contributing

See [Development Guide](../docs/development.md) for contribution guidelines.

## License

GNUv3
