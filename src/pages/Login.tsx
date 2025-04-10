import { AuthForm } from '../components/AuthForm';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function Login() {
  return (
    <>
      <Helmet>
        <title>Login - Task Management App</title>
        <meta name="description" content="Sign in to your Task Management App account to manage your tasks efficiently." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <ClipboardList className="h-12 w-12 text-indigo-600" aria-label="Task Management Logo" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <AuthForm type="login" />
          </div>
        </div>
      </div>
    </>
  );
}