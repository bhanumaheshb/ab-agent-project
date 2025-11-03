import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BeakerIcon } from '@heroicons/react/24/solid';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/projects'); // Redirect to projects page on success
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      
      {/* --- Main Card --- */}
      <div className="relative flex flex-col bg-white shadow-2xl rounded-2xl md:flex-row">
        
        {/* --- Left Side (Image) --- */}
        <div className="relative w-full md:w-1/2">
          {/* You can replace this placeholder URL with any image you want.
            Search "abstract technology" or "data analytics" on unsplash.com for great options.
          */}
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1740&auto=format&fit=crop" 
            alt="A/B testing concept with charts" 
            className="w-full h-full object-cover rounded-l-2xl md:h-auto" 
          />
          {/* 

[Image of data analytics dashboard]
 */}
        </div>
        
        {/* --- Right Side (Form) --- */}
        <div className="flex flex-col justify-center p-8 md:p-14 w-full md:w-1/2">
          
          <BeakerIcon className="mx-auto h-16 w-16 text-blue-600" />
          
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Agency Login
          </h2>
          
          {error && <p className="text-red-500 text-center font-medium mb-4">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Log In
            </button>
            
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
        
      </div>
    </div>
  );
}

export default LoginPage;
