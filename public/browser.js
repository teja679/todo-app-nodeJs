const config = {
  headers: {
    "content-type": "application/json",
  },
};

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("add_item")) {
    event.preventDefault();

    const todoText = document.getElementById("create_field");
    console.log(todoText)
    if(todoText.value === ''){
        alert('Please enter todo text')
        return
    }
    axios
      .post(
        "/create-item",
        JSON.stringify({
          todo : todoText.value
        }),
        config
      )
      .then((res) => {
        console.log(res);
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        todoText.value = ''
      })
      .catch((err) => console.log(err));
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-me")) {
    const id = event.target.getAttribute("data-id");
    const newData = prompt("Enter your new todo text");

    axios
      .post(
        "/edit-item",
        JSON.stringify({
          id,
          newData,
        }),
        config
      )
      .then((res) => {
        console.log(res);
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        event.target.parentElement.parentElement.querySelector(
          ".item-text"
        ).innerHTML = newData;
      })
      .catch((err) => console.log(err));
  }
  if (event.target.classList.contains("delete-me")) {
    const id = event.target.getAttribute("data-id");

    axios
      .post(
        "/delete-item",
        JSON.stringify({
          id,
        }),
        config
      )
      .then((res) => {
        console.log(res);
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        event.target.parentElement.parentElement.remove();
      })
      .catch((err) => console.log(err));
  }
});


document.getElementById('item_list').insertAdjacentHTML('beforeend', todos.map((item) => {
  return ` <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span class="item-text"><%= ${item.todo} %></span>
  <div>
    <button data-id="<%= ${item._id} %>" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
    <button data-id="<%= ${item._id} %>" class="delete-me btn btn-secondary btn-sm mr-1">Delete</button>
  </div>
</li>`
}).join(''))