const inForm = document.getElementById('signin-frm');
const upForm = document.getElementById('signup-frm');
inForm.addEventListener('submit', inCheck);
upForm.addEventListener('submit', upCheck);

// POST data and get response to use the result for user check
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify(data)
  });

  const status = response.status;
  const res = await response.json();
  return { status: status, response: res }
}

// Check user existence
function inCheck(e)　{
  e.preventDefault();
  document.querySelector('.alert').style.display = 'none';
  
  const usrData = {
    user_name: e.target.elements[0].value,
    password: e.target.elements[1].value
  }

  postData('/signin', usrData)
  .then(async data => {
    if (data.status === 200) {
      await authenticated();
    } else if (data.response.password === false) { 
      document.querySelector('.password-not-match').style.display = 'block'
      inForm.addEventListener('click', clearPw, {once: true});
    } else {
      document.querySelector('.user-not-exists').style.display = 'block'
      return document.addEventListener('click', () => window.location.reload('/sign'));
    }
  })
};

// Create new user and proceed to the main page
function upCheck(e) {
  e.preventDefault();
  document.querySelector('.alert').style.display = 'none';

  const regData = {
    reg_name: e.target.elements[0].value,
    reg_password: e.target.elements[1].value
  }

  if (document.getElementById('confirm_password').value !== regData.reg_password) {
    document.querySelector('.wrong-password').style.display = 'block';
    upForm.addEventListener('click', clearPw, {once: true});
  } else {
    postData('/signup', regData)
      .then(async (data) => {
        if (data.status === 201) {
          await authenticated();
        } else {
          document.querySelector('.user-already-exists').style.display = 'block';
          upForm.addEventListener('click', () => upForm.reset(), {once: true});
        }
      })
  }
};

function clearPw(e) {
  document.getElementById('password').value = '';
  document.getElementById('reg_password').value = '';
  document.getElementById('confirm_password').value = '';
}

async function authenticated() {
  await fetch('/main')
    .then(window.location.replace('../html/main.html'))
  }

document.addEventListener('click', () => {
	document.querySelectorAll('.alert').forEach((alert) => {
		alert.style.display = 'none'
	})
});
