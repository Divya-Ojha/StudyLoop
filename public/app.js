
const signupForm=document.getElementById('signupForm')?.addEventListener('submit', async(e) => {
    e.preventDefault();
    let username=document.getElementById('username').value
    let password=document.getElementById('password').value
    let email=document.getElementById('email').value
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username,  email, password }),
    });

    const message = await response.text();
    alert(message);
    if(message=='User signed up successfully.'){
      window.location.href = '/login';
    }
  });
  
  const loginForm=document.getElementById('loginForm')?.addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const message = await response.text();
      alert(message);
      if(message=='Login successful!'){
      window.location.href = '/start';
      }
    })