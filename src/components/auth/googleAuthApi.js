import { API_BASE_URL } from '../../config/apiConfig';
 
export async function signInWithGoogleApi(idToken) {
  const response = await fetch(`${API_BASE_URL}/GoogleAuth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || data?.title || 'Google Sign-In failed.');
  }
  return data;
}
