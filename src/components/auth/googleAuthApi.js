export async function signInWithGoogleApi(idToken) {
  const response = await fetch('http://localhost:5131/api/GoogleAuth/sign-in', {
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
