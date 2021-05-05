const inForm = document.getElementById('signin-frm');
const upForm = document.getElementById('signup-frm');

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
inForm.addEventListener('submit', (frm) => {
  frm.preventDefault();
  document.querySelector('.alert').style.display = 'none';

  const usrData = {
    user_name: frm.target.elements[0].value,
    password: frm.target.elements[1].value
  }

  postData('/signin', usrData)
    .then(data => {
      if (data.status === 200) {
        return window.location.replace('../html/main.html')
      } else { 
        document.querySelector('.user-not-exists').style.display = 'block'
        document.addEventListener('click', clear => window.location.reload('../html/sign.html'));
      }
    })
});

// Create new user and proceed to the main page
upForm.addEventListener('submit', (frm) => {
  frm.preventDefault();
  document.querySelector('.alert').style.display = 'none';

  const regData = {
    reg_name: frm.target.elements[0].value,
    reg_password: frm.target.elements[1].value
  }

  if (document.getElementById('confirm_password').value !== regData.reg_password) {
    document.querySelector('.wrong-password').style.display = 'block';
  } else {
    postData('/signup', regData)
      .then((data) => {
        if (data.status === 201) {
          return window.location.replace('../html/main.html')
        } else {
          document.querySelector('.user-already-exists').style.display = 'block';
          upForm.addEventListener('click', clear => upForm.reset(), {once: true});
        }
      })
  }
});

document.addEventListener('click', (alertPop) => {
	document.querySelectorAll('.alert').forEach((alert) => {
		alert.style.display = 'none'
	})
});
