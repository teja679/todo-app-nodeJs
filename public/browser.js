const config = {
    headers: {
      "content-type": "application/json",
    },
  };
  
  let skip = 0;
  
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add_item")) {
      event.preventDefault();
  
      const todoText = document.getElementById("create_field");
  
      if (todoText.value === "") {
        alert("Please enter todo text");
        return;
      }
  
      axios
        .post(
          "/create-item",
          JSON.stringify({
            todo: todoText.value,
          }),
          config
        )
        .then((res) => {
          if (res.data.status !== 200) {
            alert(res.data.message);
            return;
          }
          todoText.value = "";
        })
        .catch((err) => {
          console.log(err);
        });
    }
  
    if (event.target.classList.contains("edit-me")) {
      const id = event.target.getAttribute("data-id");
      const newData = prompt("Enter you new todo text");
  
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
          if (res.data.status !== 200) {
            alert(res.data.message);
            return;
          }
          event.target.parentElement.parentElement.querySelector(
            ".item-text"
          ).innerHTML = newData;
        })
        .catch((err) => {
          console.log(err);
        });
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
          if (res.data.status !== 200) {
            alert(res.data.message);
            return;
          }
          event.target.parentElement.parentElement.remove();
          skip -= 1;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  
    if (event.target.getAttribute("id") === "show_more") {
      console.log("hello show more");
      generateTodos();
    }
  });
  
  // document.getElementById("item_list").insertAdjacentHTML(
  //   "beforeend",
  //   todos
  //     .map((item) => {
  //       return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  //                 <span class="item-text"> ${item.todo} </span>
  //                 <div>
  //                 <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
  //                 <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
  //             </div>
  //         </li>`;
  //     })
  //     .join("")
  // );
  
  window.onload = function () {
    generateTodos();
  };
  
  function generateTodos() {
    axios
      .post(`/pagination_dashboard?skip=${skip}`, JSON.stringify({}), config)
      .then((res) => {
        if (res.status !== 200) {
          alert("Failed to read todos. Please try again.");
          return;
        }
  
        const todoList = res.data.data[0].data;
        console.log(todoList);
        if (todoList.length === 0) {
          alert("No more todos to show");
          return;
        }
  
        document.getElementById("item_list").insertAdjacentHTML(
          "beforeend",
          todoList
            .map((item) => {
              return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                  <span class="item-text"> ${item.todo} </span>
                  <div>
                  <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                  <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
              </div>
          </li>`;
            })
            .join("")
        );
  
        // Refrain from updating with a hard coded value
        // Reason: 1. Code will break incase limit changed in Backend
        // 2. Todolist may not always be of fixed length (Reading last todos)
        skip += todoList.length;
      })
      .catch((err) => {
        console.log(err);
        alert("Something went wrong. Unable to load todos.");
      });
  }