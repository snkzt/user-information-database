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
  return { status: status, response: res }; 
}

// Check user existence
inForm.addEventListener('submit', (frm) => {
  frm.preventDefault();
  document.querySelector('.alert').style.display = 'none';
  
  postData('/h', inForm)
    .then((data) => {
      if (data.status === 205) {
        document.querySelector('.user-not-exists').style.display = 'block'
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
    reg_name: frm.target.element[0].value,
    reg_password: frm.target.element[0].value
  }

  if (document.getElementById('confirm_password') !== reg_password) {
    document.querySelector('.wrong-password').style.display = 'block';
  } else {
    postData('/h', regData)
      .then((data) => {
        if (data.staus === 201) {
          document.querySelector('.sign-up-success').style.display = 'block'
          return window.location.assign('../html/main.html')
        } else {
          document.querySelector('.user-already-exists').style.display = 'block'
        }
      })
  }
});

document.addEventListener('click', (alertPop) => {
	document.querySelectorAll('.alert').forEach((alert) => {
		alert.style.display = 'none'
	})
});
