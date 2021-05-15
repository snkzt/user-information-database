// const logoutLink = document.getElementById('linkA');
// logoutLink.addEventListener('click', logOut);

// // POST data and get response to use the result for user check
// async function postData(url = '', data = {}) {
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     redirect: 'follow',
//     body: JSON.stringify(data)
//   });

//   const status = response.status;
//   const res = await response.json();
//   return { status: status, response: res }
// }

// // Check user existence
// function logOut (e)　{


//   postData('/signin', usrData)
//   .then(async data => {
//     if (data.status === 200) {
//       await authenticated();
//     } else if (data.response.password === false) { 
//       document.querySelector('.password-not-match').style.display = 'block'
//       inForm.addEventListener('click', clearPw, {once: true});
//     } else {
//       document.querySelector('.user-not-exists').style.display = 'block'
//       return document.addEventListener('click', () => window.location.reload('/sign'));
//     }
//   })
// };