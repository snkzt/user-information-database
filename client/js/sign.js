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
  console.log('a')
  postData('/h', usrData)
    .then(data => {
      if (data.status === 205) {
        document.querySelector('.user-not-exists').style.display = 'block'
        inForm.reset();
        return window.location.assign('../html/sign.html')
      } else {
        return window.location.assign('../html/main.html')
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
    postData('/h', regData)
      .then((data) => {
        if (data.status === 201) {
          document.querySelector('.sign-up-success').style.display = 'block'
          return window.location.assign('../html/main.html')
        } else if (data.staus !== 201) {
          document.querySelector('.user-already-exists').style.display = 'block'
        }
      })
  }
});

inForm.reset();
upForm.reset();

document.addEventListener('click', (alertPop) => {
	document.querySelectorAll('.alert').forEach((alert) => {
		alert.style.display = 'none'
	})
});
