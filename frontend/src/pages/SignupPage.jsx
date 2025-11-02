import React, { useState, useContext } from 'react'; // <-- Add useContext
import { AuthContext } from '../context/AuthContext'; // <-- Import AuthContext
import { useNavigate, Link } from 'react-router-dom';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(agencyName, email, password);
      navigate('/projects'); // Redirect to projects page on success
    } catch (err) {
      setError('Failed to create account. Email may already be in use.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">Create Agency Account</h2>
        
        {error && <p className="text-red-500 text-center">{error}</p>}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Agency Name</label>
          <input
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button type="submit" className="w-full py-3 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
          Sign Up
        </button>
        
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;