import { Elysia, t } from "elysia";
import * as elements from "typed-html";
import db from "./db";
import { Todo, todos } from "./db/schema";
import { eq } from "drizzle-orm";
import auth from "./routes/auth";
import { setup } from "./routes/setup";

const app = new Elysia()
  .use(setup)
  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body class="bg-slate-900 text-slate-50">
          <div hx-get="/auth" hx-trigger="clerkLoaded from:body" />
          <div
            hx-get="/todos"
            hx-trigger="load, newTodo from:body"
            hx-swap="innerHTML"
          />
        </body>
      </BaseHtml>,
    ),
  )
  .post(
    "/todos/toggle/:id/:completed",
    async ({ params }) => {
      const todo = await db
        .update(todos)
        .set({ completed: params.completed == "true" ? true : false })
        .where(eq(todos.id, params.id))
        .returning()
        .get();
      if (todo) {
        return <TodoItem todo={todo} />;
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
        completed: t.String(),
      }),
    },
  )
  .post(
    "/todos/delete/:id",
    async ({ params }) => {
      await db.delete(todos).where(eq(todos.id, params.id)).run();
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )
  .post(
    "/todos",
    async ({ body, set }) => {
      if (body.content.length === 0) {
        throw new Error("Content cannot be empty");
      }
      await db
        .insert(todos)
        .values({
          content: body.content,
          completed: false,
        })
        .returning()
        .get();

      set.headers = {
        "HX-Trigger": "newTodo",
      };
      return <TodoForm />;
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    },
  )
  .get("/styles.css", () => Bun.file("./tailwind-gen/styles.css"))
  .get("/todos", async () => {
    const data = await db.select().from(todos).all();
    return <TodoList todos={data} />;
  })
  .use(auth)
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Beth Stack</title>
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
  <script src="/clerk" async crossorigin="anonymous"></script>
  <link href="/styles.css" rel="stylesheet">
</head>
${children}
`;

const TodoItem = ({ todo }: { todo: Todo }) => {
  return (
    <div class="flex flex-row space-x-3">
      <p>{todo.content}</p>
      <input
        hx-post={`/todos/toggle/${todo.id}/${!todo.completed}`}
        hx-target="closest div"
        hx-swap="outerHTML"
        type="checkbox"
        checked={todo.completed}
      />
      <button
        hx-post={`/todos/delete/${todo.id}`}
        hx-target="closest div"
        hx-swap="outerHTML"
        class="text-red-500"
      >
        X
      </button>
    </div>
  );
};

const TodoList = ({ todos }: { todos: Todo[] }) => {
  return (
    <div class="flex flex-col space-y-3">
      {todos.map((todo) => (
        <TodoItem todo={todo} />
      ))}
      <TodoForm />
    </div>
  );
};

const TodoForm = () => {
  return (
    <form class="flex flex-row space-x-3" hx-post="/todos" hx-swap="outerHTML">
      <input
        class="border border-black text-slate-800"
        type="text"
        name="content"
      />
      <button type="submit">Add</button>
    </form>
  );
};
