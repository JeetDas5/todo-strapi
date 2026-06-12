export default {
  routes: [
    {
      method: "GET",
      path: "/my-todos",
      handler: "todo.myTodos",
      config: {
        auth: {},
      },
    },
    {
      method: "POST",
      path: "/my-todos",
      handler: "todo.createMyTodo",
      config: {
        auth: {},
      },
    },
  ],
};