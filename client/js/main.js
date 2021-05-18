const signInUser = document.getElementById('signingin-user');
const listForm = document.getElementById('list-frm');
const deleteButton = document.getElementById('delete-button');
const date = new Date();
const options = { year:'numeric', month:'numeric', day:'numeric' };
const create_date = document.getElementById('today').innerHTML = date.toLocaleDateString(undefined, options);
listForm.addEventListener('submit', saveList);
deleteButton.addEventListener('click', deleteList);
let userInfo;
let lists;

// Retrieve and store signed in user data
(async() => {
  await fetch('/main')
    .then(response => response.json())
    .then(async data => {
      userInfo = data;
      signInUser.innerHTML = userInfo.name;
    });
  await getListData();
  return userInfo;
})()

// Fetch user's lists
async function getListData() { 
  const data = { id: userInfo.id }
  postData('/getlist', data)
    .then(async data => {
      lists = await data.response;
      showLists(lists);
    });
}

// POST data
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

// Save a list
function saveList(e)　{
  e.preventDefault();
  console.log(e.target.elements[0].value)
  if (!e.target.elements[0].value) {
    newList(e)
  } else {
    modifiedList(e)
  }
};

// Save new list
function newList(e) {
  const listData = {
    user_id: userInfo.id,
    create_date: create_date,
    due_date: e.target.elements[1].value,
    item: e.target.elements[2].value
  }
  
  postData('/createlist', listData)
  .then(async data => {
    lists = await data.response;
    window.location.reload('/main');
    showLists(lists);
    document.addEventListener('click', clearInput, {once: true});
  });
}

// Save updated list
function modifiedList(e) {
  const listData = {
    item_id: e.target.elements[0].value,
    user_id: userInfo.id,
    due_date: e.target.elements[1].value,
    item: e.target.elements[2].value
  }

  postData('/updatelist', listData)
  .then(async data => {
    lists = await data.response;
    window.location.reload('/main');
    showLists(lists);
    document.addEventListener('click', clearInput, {once: true});
  });
}

// Delete a list
function deleteList(e) {
  const listData = {
    item_id: listForm[0].value,
    user_id: userInfo.id
  }

  postData('/deletelist', listData)
  .then(async data => {
    lists = await data.response;
    window.location.reload('/main');
    showLists(lists);
    document.addEventListener('click', clearInput, {once: true});
  });
}

// Show all lists
function showLists(lists) {
  lists.forEach(e => {
    const table = document.getElementById('list');
    const row = table.insertRow(1);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    const cell4 = row.insertCell(3);

    cell1.innerHTML = e.item_id;
    cell2.innerHTML = e.create_date;
    cell3.innerHTML = e.due_date;
    cell4.innerHTML = e.item;

    row.addEventListener('click', function() {
      document.getElementById('item_id').value = this.cells[0].innerHTML;
      document.getElementById('today').innerHTML = this.cells[1].innerHTML;
      document.getElementById('due').type = 'text';
      document.getElementById('due').value = this.cells[2].innerHTML;
      document.getElementById('todo').value = this.cells[3].innerHTML;
      })
  });
}

function clearInput(e) {
  document.getElementById('item_id').value = '';
  document.getElementById('due').value = '';
  document.getElementById('todo').value = '';
}
